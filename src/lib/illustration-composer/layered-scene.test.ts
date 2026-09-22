import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  composeLayeredScene,
  readPngMetadata,
} from "@/lib/illustration-composer/layered-scene";

const transparentPixel = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAF/gL+lbheAAAAAElFTkSuQmCC",
  "base64",
);

describe("layered scene composer", () => {
  it("embeds contained transparent PNGs in stable layer order", async () => {
    const directory = await mkdtemp(join(tmpdir(), "layered-scene-"));
    const assetRoot = join(directory, "assets");
    await mkdir(assetRoot);
    await writeFile(join(assetRoot, "character.png"), transparentPixel);

    const result = await composeLayeredScene(
      {
        id: "page-one",
        title: "A composed sample",
        width: 800,
        height: 600,
        layers: [
          {
            type: "ellipse",
            id: "contact-shadow",
            cx: 300,
            cy: 500,
            rx: 100,
            ry: 20,
            fill: "#000000",
            opacity: 0.2,
          },
          {
            type: "bitmap",
            id: "character",
            source: "character.png",
            x: 300,
            y: 500,
            width: 200,
          },
        ],
      },
      assetRoot,
    );

    expect(result.svg.indexOf('id="contact-shadow"')).toBeLessThan(
      result.svg.indexOf('id="character"'),
    );
    expect(result.svg).toContain("data:image/png;base64,");
    expect(result.assets).toMatchObject([
      {
        kind: "bitmap",
        layerId: "character",
        source: "character.png",
        width: 1,
        height: 1,
        colorType: 6,
        hasAlpha: true,
      },
    ]);
  });

  it("embeds a safe contained SVG as a reusable vector layer", async () => {
    const directory = await mkdtemp(join(tmpdir(), "layered-scene-"));
    await writeFile(
      join(directory, "character.svg"),
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 200"><circle cx="60" cy="60" r="40" fill="#799a92"/></svg>',
    );

    const result = await composeLayeredScene(
      {
        id: "vector-page",
        title: "A vector sample",
        width: 800,
        height: 600,
        layers: [
          {
            type: "vector",
            id: "vector-character",
            source: "character.svg",
            x: 300,
            y: 500,
            width: 180,
          },
        ],
      },
      directory,
    );

    expect(result.svg).toContain("data:image/svg+xml;base64,");
    expect(result.svg).toContain('data-layer-type="vector"');
    expect(result.assets).toMatchObject([
      {
        kind: "vector",
        layerId: "vector-character",
        source: "character.svg",
        width: 120,
        height: 200,
      },
    ]);
  });

  it("rejects SVG assets with active or externally loaded content", async () => {
    const directory = await mkdtemp(join(tmpdir(), "layered-scene-"));
    await writeFile(
      join(directory, "unsafe.svg"),
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><script>alert(1)</script></svg>',
    );

    await expect(
      composeLayeredScene(
        {
          id: "unsafe-vector-page",
          title: "Unsafe vector sample",
          width: 100,
          height: 100,
          layers: [
            {
              type: "vector",
              id: "unsafe-vector",
              source: "unsafe.svg",
              x: 50,
              y: 100,
              width: 50,
            },
          ],
        },
        directory,
      ),
    ).rejects.toThrow("prohibited active or external content");
  });

  it("rejects a required cutout when the PNG has no alpha channel", async () => {
    const directory = await mkdtemp(join(tmpdir(), "layered-scene-"));
    const opaquePixel = Buffer.from(transparentPixel);
    opaquePixel[25] = 2;
    await writeFile(join(directory, "opaque.png"), opaquePixel);

    await expect(
      composeLayeredScene(
        {
          id: "invalid-page",
          title: "Invalid cutout",
          width: 100,
          height: 100,
          layers: [
            {
              type: "bitmap",
              id: "opaque-character",
              source: "opaque.png",
              x: 50,
              y: 100,
              width: 50,
            },
          ],
        },
        directory,
      ),
    ).rejects.toThrow("has no alpha channel");
  });

  it("rejects traversal outside the configured asset root", async () => {
    const directory = await mkdtemp(join(tmpdir(), "layered-scene-"));
    const assetRoot = join(directory, "assets");
    await mkdir(assetRoot);
    await writeFile(join(directory, "outside.png"), transparentPixel);

    await expect(
      composeLayeredScene(
        {
          id: "unsafe-page",
          title: "Unsafe path",
          width: 100,
          height: 100,
          layers: [
            {
              type: "bitmap",
              id: "unsafe-character",
              source: "../outside.png",
              x: 50,
              y: 100,
              width: 50,
            },
          ],
        },
        assetRoot,
      ),
    ).rejects.toThrow("outside the configured asset root");
  });

  it("reads structural alpha metadata from a PNG", () => {
    expect(readPngMetadata(transparentPixel)).toEqual({
      width: 1,
      height: 1,
      colorType: 6,
      hasAlpha: true,
    });
  });

  it("accepts a grayscale PNG that does not claim transparency", () => {
    const grayscalePixel = Buffer.from(transparentPixel);
    grayscalePixel[25] = 0;

    expect(readPngMetadata(grayscalePixel)).toMatchObject({
      colorType: 0,
      hasAlpha: false,
    });
  });
});
