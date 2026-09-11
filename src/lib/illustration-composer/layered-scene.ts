import { createHash } from "node:crypto";
import { readFile, realpath } from "node:fs/promises";
import { isAbsolute, relative, resolve } from "node:path";

import { z } from "zod";

const finiteNumberSchema = z.number().finite();
const opacitySchema = finiteNumberSchema.min(0).max(1);
const colorSchema = z.string().trim().min(1).max(120);
const layerIdSchema = z.string().regex(/^[a-z][a-z0-9_-]*$/);

const bitmapLayerSchema = z.object({
  type: z.literal("bitmap"),
  id: layerIdSchema,
  source: z.string().trim().min(1).max(500),
  x: finiteNumberSchema,
  y: finiteNumberSchema,
  width: finiteNumberSchema.positive(),
  height: finiteNumberSchema.positive().optional(),
  anchorX: finiteNumberSchema.min(0).max(1).default(0.5),
  anchorY: finiteNumberSchema.min(0).max(1).default(1),
  rotation: finiteNumberSchema.default(0),
  flipX: z.boolean().default(false),
  opacity: opacitySchema.default(1),
  fit: z.enum(["contain", "cover", "stretch"]).default("contain"),
  requireAlpha: z.boolean().default(true),
});

const ellipseLayerSchema = z.object({
  type: z.literal("ellipse"),
  id: layerIdSchema,
  cx: finiteNumberSchema,
  cy: finiteNumberSchema,
  rx: finiteNumberSchema.positive(),
  ry: finiteNumberSchema.positive(),
  fill: colorSchema,
  opacity: opacitySchema.default(1),
  blur: finiteNumberSchema.min(0).max(100).default(0),
});

const pathLayerSchema = z.object({
  type: z.literal("path"),
  id: layerIdSchema,
  d: z.string().trim().min(1).max(10_000),
  fill: colorSchema.default("none"),
  stroke: colorSchema,
  strokeWidth: finiteNumberSchema.positive(),
  opacity: opacitySchema.default(1),
  linecap: z.enum(["butt", "round", "square"]).default("round"),
  dasharray: z.string().trim().max(120).optional(),
});

const textBoxLayerSchema = z.object({
  type: z.literal("text-box"),
  id: layerIdSchema,
  x: finiteNumberSchema,
  y: finiteNumberSchema,
  width: finiteNumberSchema.positive(),
  lines: z.array(z.string().trim().min(1).max(240)).min(1).max(8),
  padding: finiteNumberSchema.min(0).default(28),
  fontSize: finiteNumberSchema.positive().max(160).default(38),
  lineHeight: finiteNumberSchema.positive().max(200).default(50),
  fontFamily: z.string().trim().min(1).max(200).default("Georgia, serif"),
  fontWeight: z.enum(["normal", "bold"]).default("normal"),
  fill: colorSchema.default("#26352f"),
  backgroundFill: colorSchema.default("rgba(255, 252, 238, 0.84)"),
  borderColor: colorSchema.default("rgba(91, 90, 66, 0.18)"),
  cornerRadius: finiteNumberSchema.min(0).max(100).default(24),
});

export const layeredSceneSchema = z
  .object({
    id: layerIdSchema,
    title: z.string().trim().min(1).max(200),
    width: z.number().int().positive().max(8_192),
    height: z.number().int().positive().max(8_192),
    background: colorSchema.default("#ffffff"),
    layers: z
      .array(
        z.discriminatedUnion("type", [
          bitmapLayerSchema,
          ellipseLayerSchema,
          pathLayerSchema,
          textBoxLayerSchema,
        ]),
      )
      .min(1)
      .max(100),
  })
  .superRefine((scene, context) => {
    const seen = new Set<string>();
    for (const layer of scene.layers) {
      if (seen.has(layer.id)) {
        context.addIssue({
          code: "custom",
          message: `Layer id ${layer.id} is duplicated.`,
          path: ["layers", scene.layers.indexOf(layer), "id"],
        });
      }
      seen.add(layer.id);
    }
  });

export type LayeredSceneInput = z.input<typeof layeredSceneSchema>;

export type PngMetadata = {
  width: number;
  height: number;
  colorType: number;
  hasAlpha: boolean;
};

export type ComposedBitmapAsset = PngMetadata & {
  layerId: string;
  source: string;
  sha256: string;
  bytes: number;
};

export type ComposedLayeredScene = {
  sceneId: string;
  svg: string;
  assets: ComposedBitmapAsset[];
};

const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

export function readPngMetadata(bytes: Uint8Array): PngMetadata {
  const buffer = Buffer.from(bytes);
  if (
    buffer.byteLength < 33 ||
    !buffer.subarray(0, pngSignature.byteLength).equals(pngSignature) ||
    buffer.toString("ascii", 12, 16) !== "IHDR"
  ) {
    throw new Error("The asset is not a valid PNG with an IHDR chunk.");
  }

  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  const colorType = buffer[25];
  if (
    colorType === undefined ||
    ![0, 2, 3, 4, 6].includes(colorType) ||
    width === 0 ||
    height === 0
  ) {
    throw new Error("The PNG has invalid dimensions or color metadata.");
  }

  let hasTransparencyChunk = false;
  let offset = 8;
  while (offset + 12 <= buffer.byteLength) {
    const chunkLength = buffer.readUInt32BE(offset);
    const chunkType = buffer.toString("ascii", offset + 4, offset + 8);
    if (chunkType === "tRNS") hasTransparencyChunk = true;
    offset += chunkLength + 12;
    if (chunkType === "IEND") break;
  }

  return {
    width,
    height,
    colorType,
    hasAlpha: colorType === 4 || colorType === 6 || hasTransparencyChunk,
  };
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function compactNumber(value: number): string {
  return Number(value.toFixed(3)).toString();
}

function preserveAspectRatio(fit: "contain" | "cover" | "stretch"): string {
  if (fit === "stretch") return "none";
  return fit === "cover" ? "xMidYMid slice" : "xMidYMid meet";
}

async function readContainedAsset(
  assetRoot: string,
  source: string,
): Promise<{ bytes: Buffer; path: string }> {
  const rootPath = await realpath(assetRoot);
  const requestedPath = resolve(rootPath, source);
  const assetPath = await realpath(requestedPath);
  const pathFromRoot = relative(rootPath, assetPath);

  if (
    pathFromRoot === "" ||
    pathFromRoot.startsWith("..") ||
    isAbsolute(pathFromRoot)
  ) {
    throw new Error(`Asset ${source} is outside the configured asset root.`);
  }

  if (!assetPath.toLowerCase().endsWith(".png")) {
    throw new Error(`Asset ${source} must be a PNG in this prototype.`);
  }

  const bytes = await readFile(assetPath);
  if (bytes.byteLength > 25 * 1024 * 1024) {
    throw new Error(`Asset ${source} exceeds the 25 MiB prototype limit.`);
  }
  return { bytes, path: pathFromRoot };
}

function renderTextBox(layer: z.output<typeof textBoxLayerSchema>): string {
  const height = layer.padding * 2 + layer.lines.length * layer.lineHeight;
  const textX = layer.x + layer.padding;
  const firstBaseline = layer.y + layer.padding + layer.fontSize;
  const tspans = layer.lines
    .map(
      (line, index) =>
        `<tspan x="${compactNumber(textX)}" y="${compactNumber(firstBaseline + index * layer.lineHeight)}">${escapeXml(line)}</tspan>`,
    )
    .join("");

  return `<g id="${layer.id}" data-layer-type="text-box"><rect x="${compactNumber(layer.x)}" y="${compactNumber(layer.y)}" width="${compactNumber(layer.width)}" height="${compactNumber(height)}" rx="${compactNumber(layer.cornerRadius)}" fill="${escapeXml(layer.backgroundFill)}" stroke="${escapeXml(layer.borderColor)}"/><text font-family="${escapeXml(layer.fontFamily)}" font-size="${compactNumber(layer.fontSize)}" font-weight="${layer.fontWeight}" fill="${escapeXml(layer.fill)}">${tspans}</text></g>`;
}

export async function composeLayeredScene(
  input: LayeredSceneInput,
  assetRoot: string,
): Promise<ComposedLayeredScene> {
  const scene = layeredSceneSchema.parse(input);
  const assets: ComposedBitmapAsset[] = [];
  const renderedLayers: string[] = [];
  const filters: string[] = [];

  for (const layer of scene.layers) {
    if (layer.type === "bitmap") {
      const asset = await readContainedAsset(assetRoot, layer.source);
      const metadata = readPngMetadata(asset.bytes);
      if (layer.requireAlpha && !metadata.hasAlpha) {
        throw new Error(
          `Layer ${layer.id} requires transparency, but ${layer.source} has no alpha channel.`,
        );
      }

      const height =
        layer.height ?? layer.width * (metadata.height / metadata.width);
      const x = -layer.width * layer.anchorX;
      const y = -height * layer.anchorY;
      const scaleX = layer.flipX ? -1 : 1;
      const transform = `translate(${compactNumber(layer.x)} ${compactNumber(layer.y)}) rotate(${compactNumber(layer.rotation)}) scale(${scaleX} 1)`;
      const dataUri = `data:image/png;base64,${asset.bytes.toString("base64")}`;

      renderedLayers.push(
        `<g id="${layer.id}" data-layer-type="bitmap" data-source="${escapeXml(asset.path)}" transform="${transform}" opacity="${compactNumber(layer.opacity)}"><image href="${dataUri}" x="${compactNumber(x)}" y="${compactNumber(y)}" width="${compactNumber(layer.width)}" height="${compactNumber(height)}" preserveAspectRatio="${preserveAspectRatio(layer.fit)}"/></g>`,
      );
      assets.push({
        layerId: layer.id,
        source: asset.path,
        ...metadata,
        sha256: createHash("sha256").update(asset.bytes).digest("hex"),
        bytes: asset.bytes.byteLength,
      });
      continue;
    }

    if (layer.type === "ellipse") {
      const filter = layer.blur > 0 ? ` filter="url(#blur-${layer.id})"` : "";
      if (layer.blur > 0) {
        filters.push(
          `<filter id="blur-${layer.id}" x="-50%" y="-100%" width="200%" height="300%"><feGaussianBlur stdDeviation="${compactNumber(layer.blur)}"/></filter>`,
        );
      }
      renderedLayers.push(
        `<ellipse id="${layer.id}" data-layer-type="ellipse" cx="${compactNumber(layer.cx)}" cy="${compactNumber(layer.cy)}" rx="${compactNumber(layer.rx)}" ry="${compactNumber(layer.ry)}" fill="${escapeXml(layer.fill)}" opacity="${compactNumber(layer.opacity)}"${filter}/>`,
      );
      continue;
    }

    if (layer.type === "path") {
      const dasharray = layer.dasharray
        ? ` stroke-dasharray="${escapeXml(layer.dasharray)}"`
        : "";
      renderedLayers.push(
        `<path id="${layer.id}" data-layer-type="path" d="${escapeXml(layer.d)}" fill="${escapeXml(layer.fill)}" stroke="${escapeXml(layer.stroke)}" stroke-width="${compactNumber(layer.strokeWidth)}" stroke-linecap="${layer.linecap}" opacity="${compactNumber(layer.opacity)}"${dasharray}/>`,
      );
      continue;
    }

    renderedLayers.push(renderTextBox(layer));
  }

  const descriptionId = `${scene.id}-description`;
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${scene.width}" height="${scene.height}" viewBox="0 0 ${scene.width} ${scene.height}" role="img" aria-labelledby="${descriptionId}">`,
    `<title id="${descriptionId}">${escapeXml(scene.title)}</title>`,
    filters.length > 0 ? `<defs>${filters.join("")}</defs>` : "",
    `<rect width="${scene.width}" height="${scene.height}" fill="${escapeXml(scene.background)}"/>`,
    renderedLayers.join(""),
    `</svg>`,
  ].join("");

  return { sceneId: scene.id, svg, assets };
}
