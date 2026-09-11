import { createHash } from "node:crypto";
import { access, mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import { chromium } from "playwright";

import { composeLayeredScene } from "../src/lib/illustration-composer/layered-scene.ts";

const demoRoot = resolve("data/prototypes/layered-stitcher");
const assetRoot = resolve("tasks/examples/layered-stitcher/assets");
const outputRoot = join(demoRoot, "output");

const background = {
  type: "bitmap",
  id: "meadow-background",
  source: "meadow-background.png",
  x: 0,
  y: 0,
  width: 1536,
  height: 1024,
  anchorX: 0,
  anchorY: 0,
  fit: "cover",
  requireAlpha: false,
};

const scenes = [
  {
    id: "page-one",
    title: "Pip pauses at the beginning of the meadow path.",
    width: 1536,
    height: 1024,
    layers: [
      background,
      {
        type: "ellipse",
        id: "pip-shadow",
        cx: 704,
        cy: 956,
        rx: 145,
        ry: 25,
        fill: "#443725",
        opacity: 0.24,
        blur: 14,
      },
      {
        type: "bitmap",
        id: "pip-standing",
        source: "pip-standing.png",
        x: 704,
        y: 970,
        width: 410,
      },
      {
        type: "text-box",
        id: "story-text",
        x: 980,
        y: 94,
        width: 474,
        lines: [
          "Pip paused where the",
          "path began. The morning",
          "seemed to be waiting.",
        ],
        fontSize: 36,
        lineHeight: 46,
      },
    ],
  },
  {
    id: "page-two",
    title: "Pip notices a red kite above the meadow.",
    width: 1536,
    height: 1024,
    layers: [
      background,
      {
        type: "ellipse",
        id: "pip-shadow",
        cx: 680,
        cy: 956,
        rx: 145,
        ry: 25,
        fill: "#443725",
        opacity: 0.24,
        blur: 14,
      },
      {
        type: "bitmap",
        id: "pip-standing",
        source: "pip-standing.png",
        x: 680,
        y: 970,
        width: 410,
      },
      {
        type: "path",
        id: "kite-string",
        d: "M 780 748 C 910 695, 1040 635, 1150 550",
        stroke: "#776b56",
        strokeWidth: 3,
        opacity: 0.72,
      },
      {
        type: "bitmap",
        id: "red-kite",
        source: "red-kite.png",
        x: 1210,
        y: 565,
        width: 360,
        anchorX: 0.5,
        anchorY: 1,
        rotation: -5,
      },
      {
        type: "text-box",
        id: "story-text",
        x: 930,
        y: 82,
        width: 524,
        lines: [
          "Something red danced",
          "above the flowers.",
          "A kite tugged at the sky.",
        ],
        fontSize: 36,
        lineHeight: 46,
      },
    ],
  },
  {
    id: "page-three",
    title: "Pip follows the red kite down the meadow path.",
    width: 1536,
    height: 1024,
    layers: [
      background,
      {
        type: "ellipse",
        id: "pip-shadow",
        cx: 800,
        cy: 958,
        rx: 155,
        ry: 27,
        fill: "#443725",
        opacity: 0.24,
        blur: 14,
      },
      {
        type: "bitmap",
        id: "pip-walking",
        source: "pip-walking.png",
        x: 800,
        y: 980,
        width: 440,
      },
      {
        type: "path",
        id: "kite-string",
        d: "M 940 736 C 1015 642, 1080 545, 1140 420",
        stroke: "#776b56",
        strokeWidth: 3,
        opacity: 0.72,
      },
      {
        type: "bitmap",
        id: "red-kite",
        source: "red-kite.png",
        x: 1200,
        y: 390,
        width: 330,
        anchorX: 0.5,
        anchorY: 1,
        rotation: -9,
      },
      {
        type: "text-box",
        id: "story-text",
        x: 90,
        y: 94,
        width: 600,
        lines: ["Pip followed, one brave step at a time."],
      },
    ],
  },
  {
    id: "page-four-layered",
    title: "The kite swoops low and Pip looks mildly worried.",
    width: 1536,
    height: 1024,
    layers: [
      background,
      {
        type: "ellipse",
        id: "pip-shadow",
        cx: 680,
        cy: 956,
        rx: 145,
        ry: 25,
        fill: "#443725",
        opacity: 0.24,
        blur: 14,
      },
      {
        type: "bitmap",
        id: "pip-worried",
        source: "pip-worried.png",
        x: 680,
        y: 970,
        width: 410,
      },
      {
        type: "path",
        id: "kite-string",
        d: "M 780 748 C 880 720, 965 680, 1040 625",
        stroke: "#776b56",
        strokeWidth: 3,
        opacity: 0.72,
      },
      {
        type: "bitmap",
        id: "red-kite",
        source: "red-kite.png",
        x: 1125,
        y: 720,
        width: 350,
        anchorX: 0.5,
        anchorY: 1,
        rotation: 12,
      },
      {
        type: "text-box",
        id: "story-text",
        x: 930,
        y: 82,
        width: 524,
        lines: [
          "The kite swooped low.",
          "Pip's smile became",
          "a worried little O.",
        ],
        fontSize: 36,
        lineHeight: 46,
      },
    ],
  },
  {
    id: "page-four-single-prompt",
    title: "Single-prompt comparison for the same story beat.",
    width: 1536,
    height: 1024,
    layers: [
      {
        type: "bitmap",
        id: "single-prompt-art",
        source: "page-four-single-prompt-art.png",
        x: 0,
        y: 0,
        width: 1536,
        height: 1024,
        anchorX: 0,
        anchorY: 0,
        fit: "cover",
        requireAlpha: false,
      },
      {
        type: "text-box",
        id: "story-text",
        x: 930,
        y: 82,
        width: 524,
        lines: [
          "The kite swooped low.",
          "Pip's smile became",
          "a worried little O.",
        ],
        fontSize: 36,
        lineHeight: 46,
      },
    ],
  },
];

await mkdir(outputRoot, { recursive: true });
let browserLaunchOptions = { headless: true };
try {
  await access(chromium.executablePath());
} catch {
  browserLaunchOptions = { ...browserLaunchOptions, channel: "chrome" };
}
const browser = await chromium.launch(browserLaunchOptions);
const outputs = [];

try {
  for (const scene of scenes) {
    const renderStartedAt = performance.now();
    const composed = await composeLayeredScene(scene, assetRoot);
    const svgPath = join(outputRoot, `${scene.id}.svg`);
    const pngPath = join(outputRoot, `${scene.id}.png`);
    await writeFile(svgPath, composed.svg);

    const page = await browser.newPage({
      viewport: { width: scene.width, height: scene.height },
      deviceScaleFactor: 1,
    });
    await page.setContent(
      `<!doctype html><html><head><style>html,body{margin:0;width:100%;height:100%;overflow:hidden}svg{display:block}</style></head><body>${composed.svg}</body></html>`,
    );
    await page.waitForFunction(() =>
      [...document.images].every((image) => image.complete),
    );
    await page.locator("svg").screenshot({ path: pngPath });
    await page.close();

    outputs.push({
      sceneId: scene.id,
      svg: svgPath,
      png: pngPath,
      renderDurationMs: Math.round(performance.now() - renderStartedAt),
      svgSha256: createHash("sha256").update(composed.svg).digest("hex"),
      assets: composed.assets,
    });
  }
} finally {
  await browser.close();
}

const reuse = new Map();
for (const output of outputs) {
  for (const asset of output.assets) {
    const entry = reuse.get(asset.sha256) ?? {
      source: asset.source,
      sha256: asset.sha256,
      pages: [],
    };
    entry.pages.push(output.sceneId);
    reuse.set(asset.sha256, entry);
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  compositor: "typescript-svg-playwright-v1",
  outputSize: { width: 1536, height: 1024 },
  generationTrials: [
    {
      id: "layered-expression-first-attempt",
      elapsedMs: 23125,
      outcome: "rejected-baked-checkerboard-no-alpha",
      output: "not-committed/pip-worried-baked-checkerboard.png",
    },
    {
      id: "layered-expression-retry",
      elapsedMs: 42270,
      outcome: "accepted-transparent-character-layer",
      output: "tasks/examples/layered-stitcher/assets/pip-worried.png",
    },
    {
      id: "single-prompt-page-art",
      elapsedMs: 39931,
      outcome: "accepted-opaque-full-page-art",
      output:
        "tasks/examples/layered-stitcher/assets/page-four-single-prompt-art.png",
    },
  ],
  pages: outputs,
  reusedAssets: [...reuse.values()].map((entry) => ({
    ...entry,
    useCount: entry.pages.length,
  })),
};

await writeFile(
  join(outputRoot, "composition-report.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);

console.log(`Rendered ${outputs.length} pages to ${outputRoot}`);
for (const entry of report.reusedAssets) {
  console.log(`${entry.source}: ${entry.useCount} page(s)`);
}
