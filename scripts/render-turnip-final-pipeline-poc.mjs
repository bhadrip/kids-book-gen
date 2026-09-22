import { createHash } from "node:crypto";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

import { chromium } from "playwright";

import { composeLayeredScene } from "../src/lib/illustration-composer/layered-scene.ts";
import { renderPhysicsPoseProofSvg } from "../src/lib/illustration-physics/physics-proof-svg.ts";
import { compilePullScene } from "../src/lib/illustration-physics/pull-scene-compiler.ts";
import { buildSingleActorPullProof } from "../src/lib/illustration-physics/rapier-pose-proof.ts";

const repositoryRoot = resolve(".");
const outputRoot = resolve("data/prototypes/turnip-final-pipeline-poc");
const assetRoot = repositoryRoot;
const plantModuleSource =
  "data/prototypes/turnip-final-pipeline-poc/assets/plant-interaction-module-v1.png";
const gardenBackgroundSource =
  "data/prototypes/turnip-style-preserved/assets/garden-clean-low-contrast.png";
const gripInteractionEditSource =
  "data/prototypes/turnip-final-pipeline-poc/assets/mae-grip-interaction-edit-v4.png";
const gripInteractionPatchSource =
  "data/prototypes/turnip-final-pipeline-poc/assets/mae-grip-interaction-patch-v4.png";
const bootInteractionEditSource =
  "data/prototypes/turnip-final-pipeline-poc/assets/mae-boot-ground-interaction-edit-v5.png";
const bootInteractionPatchSource =
  "data/prototypes/turnip-final-pipeline-poc/assets/mae-boot-ground-interaction-patch-v5.png";

const maeRig = {
  id: "mae-pull-v1",
  asset: {
    source:
      "data/prototypes/turnip-style-preserved/assets/mae-pull-intensity-4.png",
    width: 1_374,
    height: 1_145,
  },
  landmarks: {
    head: { x: 0.5, y: 0.25 },
    shoulder: { x: 0.49, y: 0.42 },
    hip: { x: 0.55, y: 0.68 },
    leftFoot: { x: 0.24, y: 0.96 },
    rightFoot: { x: 0.61, y: 0.96 },
    leftHand: { x: 0.835, y: 0.43 },
    rightHand: { x: 0.875, y: 0.43 },
  },
};

const pageSpec = {
  id: "turnip-pull-page-poc-v1",
  page: { width: 1_536, height: 1_024, pixelsPerWorldUnit: 180 },
  characterPlacement: { left: 50, top: 170, width: 900 },
  sceneAnchors: { soilY: 900, crown: { x: 1_190, y: 880 } },
  action: {
    type: "pull-rooted-plant",
    leafTopLength: 230,
    turnipRadiusX: 86,
    turnipRadiusY: 110,
    minimumBuriedRatio: 0.9,
    maximumStalkAlignmentDegrees: 18,
    minimumCounterbalance: 0.25,
    performanceIntensity: 4,
  },
};

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

async function findChromiumExecutable() {
  const configured = chromium.executablePath();
  try {
    await access(configured);
    return configured;
  } catch {
    // Continue to the shared browser cache.
  }

  const cacheRoot = join(homedir(), "Library/Caches/ms-playwright");
  const { readdir } = await import("node:fs/promises");
  const entries = (await readdir(cacheRoot, { withFileTypes: true }))
    .filter(
      (entry) =>
        entry.isDirectory() &&
        entry.name.startsWith("chromium_headless_shell-"),
    )
    .map((entry) => entry.name)
    .sort()
    .reverse();

  for (const entry of entries) {
    for (const platformDirectory of [
      "chrome-headless-shell-mac-arm64",
      "chrome-headless-shell-mac-x64",
    ]) {
      const candidate = join(
        cacheRoot,
        entry,
        platformDirectory,
        "chrome-headless-shell",
      );
      try {
        await access(candidate);
        return candidate;
      } catch {
        // Continue.
      }
    }
  }
  throw new Error("No compatible Playwright Chromium executable was found.");
}

function renderPlantGuideSvg(compiled) {
  const { pageCoordinates, page } = compiled;
  const [leftHand, rightHand] = pageCoordinates.hands;
  const leafPaths = pageCoordinates.leafTips
    .map(
      (tip) =>
        `<path d="M ${pageCoordinates.grip.x} ${pageCoordinates.grip.y} Q ${(pageCoordinates.grip.x + tip.x) / 2} ${(pageCoordinates.grip.y + tip.y) / 2 - 22} ${tip.x} ${tip.y}" fill="none" stroke="#86a960" stroke-width="48" stroke-linecap="round"/><path d="M ${pageCoordinates.grip.x} ${pageCoordinates.grip.y} L ${tip.x} ${tip.y}" fill="none" stroke="#587744" stroke-width="4"/>`,
    )
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${page.width}" height="${page.height}" viewBox="0 0 ${page.width} ${page.height}">
  <rect width="${page.width}" height="${page.height}" fill="#f6f3ea"/>
  <path d="M 0 ${pageCoordinates.soilY} H ${page.width}" stroke="#9a8062" stroke-width="4" stroke-dasharray="18 12"/>
  <path d="M ${pageCoordinates.crown.x} ${pageCoordinates.crown.y} C 1100 780, 990 640, ${pageCoordinates.grip.x} ${pageCoordinates.grip.y}" fill="none" stroke="#60864d" stroke-width="24" stroke-linecap="round"/>
  <path d="M ${pageCoordinates.crown.x + 18} ${pageCoordinates.crown.y} C 1120 790, 1010 650, ${pageCoordinates.grip.x + 8} ${pageCoordinates.grip.y + 5}" fill="none" stroke="#8baa65" stroke-width="18" stroke-linecap="round"/>
  ${leafPaths}
  <ellipse cx="${pageCoordinates.crown.x}" cy="${pageCoordinates.crown.y + 5}" rx="54" ry="20" fill="#8d648d"/>
  <path d="M ${pageCoordinates.crown.x - 100} ${pageCoordinates.soilY} Q ${pageCoordinates.crown.x} ${pageCoordinates.crown.y - 8} ${pageCoordinates.crown.x + 100} ${pageCoordinates.soilY}" fill="#8a6748" opacity=".72"/>
  <circle cx="${leftHand.x}" cy="${leftHand.y}" r="16" fill="none" stroke="#d48245" stroke-width="5"/>
  <circle cx="${rightHand.x}" cy="${rightHand.y}" r="16" fill="none" stroke="#d48245" stroke-width="5"/>
  <path d="M ${pageCoordinates.grip.x} ${pageCoordinates.grip.y} L ${pageCoordinates.grip.x - 170} ${pageCoordinates.grip.y - 170}" stroke="#1f7770" stroke-width="7" marker-end="url(#arrow)"/>
  <defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 L10 5 L0 10Z" fill="#1f7770"/></marker></defs>
  <g font-family="system-ui,sans-serif" font-weight="700" fill="#31433f">
    <text x="80" y="90" font-size="31">PLANT MODULE GEOMETRY GUIDE — DO NOT RENDER LABELS</text>
    <text x="${pageCoordinates.grip.x - 165}" y="${pageCoordinates.grip.y + 55}" font-size="24">TWO-HAND GRIP</text>
    <text x="${pageCoordinates.crown.x - 110}" y="${pageCoordinates.crown.y + 75}" font-size="24">BURIED CROWN</text>
    <text x="${pageCoordinates.grip.x - 360}" y="${pageCoordinates.grip.y - 190}" font-size="24">LEAFY TOPS FACE MAE</text>
  </g>
</svg>`;
}

async function renderSvg(page, svg, path) {
  await page.setViewportSize({ width: 1_536, height: 1_024 });
  await page.setContent(
    `<style>*{box-sizing:border-box}html,body{margin:0;width:1536px;height:1024px;overflow:hidden}</style>${svg}`,
    { waitUntil: "load" },
  );
  await page.screenshot({ path, type: "png" });
}

async function renderTransparentSvg(page, svg, path) {
  await page.setViewportSize({ width: 1_536, height: 1_024 });
  await page.setContent(
    `<style>*{box-sizing:border-box}html,body{margin:0;width:1536px;height:1024px;overflow:hidden;background:transparent}</style>${svg}`,
    { waitUntil: "load" },
  );
  await page.screenshot({ path, type: "png", omitBackground: true });
}

function renderGripInteractionPatchSvg(editBytes) {
  const editDataUri = `data:image/png;base64,${editBytes.toString("base64")}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1024" viewBox="0 0 1536 1024">
  <defs>
    <filter id="grip-feather" x="-30%" y="-40%" width="160%" height="180%"><feGaussianBlur stdDeviation="10"/></filter>
    <mask id="grip-interaction-mask"><rect width="1536" height="1024" fill="black"/><ellipse cx="822" cy="490" rx="132" ry="94" fill="white" filter="url(#grip-feather)"/></mask>
  </defs>
  <image href="${editDataUri}" x="570" y="315" width="640" height="400" preserveAspectRatio="none" mask="url(#grip-interaction-mask)"/>
</svg>`;
}

function renderBootInteractionPatchSvg(editBytes) {
  const editDataUri = `data:image/png;base64,${editBytes.toString("base64")}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1024" viewBox="0 0 1536 1024">
  <defs>
    <filter id="boot-feather" x="-30%" y="-40%" width="160%" height="180%"><feGaussianBlur stdDeviation="14"/></filter>
    <mask id="boot-interaction-mask"><rect width="1536" height="1024" fill="black"/><ellipse cx="286" cy="830" rx="205" ry="154" fill="white" filter="url(#boot-feather)"/></mask>
  </defs>
  <image href="${editDataUri}" x="60" y="590" width="640" height="400" preserveAspectRatio="none" mask="url(#boot-interaction-mask)"/>
</svg>`;
}

async function renderBootComparison(page, beforePath, afterPath, outputPath) {
  const [before, after] = await Promise.all([
    readFile(beforePath),
    readFile(afterPath),
  ]);
  const beforeUri = `data:image/png;base64,${before.toString("base64")}`;
  const afterUri = `data:image/png;base64,${after.toString("base64")}`;
  await page.setViewportSize({ width: 1_536, height: 570 });
  await page.setContent(
    `<style>
      *{box-sizing:border-box}html,body{margin:0;width:1536px;height:570px;overflow:hidden;background:#f4f0e8;font-family:system-ui,sans-serif}
      main{display:flex;gap:16px;padding:54px 16px 16px}.panel{position:relative;width:744px;height:500px;overflow:hidden;border:3px solid #fff;box-shadow:0 2px 10px #0002;background:#ddd}.panel img{position:absolute;width:1536px;height:1024px;left:-40px;top:-515px}.label{position:absolute;top:12px;font-size:26px;font-weight:750;color:#26352f}.before{left:24px}.after{left:784px}
    </style><div class="label before">BEFORE — boot above flattened foliage</div><div class="label after">AFTER — foreground leaf occludes boot</div><main><div class="panel"><img src="${beforeUri}"></div><div class="panel"><img src="${afterUri}"></div></main>`,
    { waitUntil: "load" },
  );
  await page.screenshot({ path: outputPath, type: "png" });
}

async function renderGripComparison(page, beforePath, afterPath, outputPath) {
  const [before, after] = await Promise.all([
    readFile(beforePath),
    readFile(afterPath),
  ]);
  const beforeUri = `data:image/png;base64,${before.toString("base64")}`;
  const afterUri = `data:image/png;base64,${after.toString("base64")}`;
  await page.setViewportSize({ width: 1_536, height: 520 });
  await page.setContent(
    `<style>
      *{box-sizing:border-box}html,body{margin:0;width:1536px;height:520px;overflow:hidden;background:#f4f0e8;font-family:system-ui,sans-serif}
      main{display:flex;gap:16px;padding:54px 16px 16px}.panel{position:relative;width:744px;height:450px;overflow:hidden;border:3px solid #fff;box-shadow:0 2px 10px #0002;background:#ddd}.panel img{position:absolute;width:1536px;height:1024px;left:-570px;top:-285px}.label{position:absolute;top:12px;font-size:26px;font-weight:750;color:#26352f}.before{left:24px}.after{left:784px}
    </style><div class="label before">BEFORE — closed fist pasted over stems</div><div class="label after">AFTER — selected stems cross inside the grip</div><main><div class="panel"><img src="${beforeUri}"></div><div class="panel"><img src="${afterUri}"></div></main>`,
    { waitUntil: "load" },
  );
  await page.screenshot({ path: outputPath, type: "png" });
}

async function renderGripEditTarget(page, sourcePath, outputPath) {
  const source = await readFile(sourcePath);
  const sourceUri = `data:image/png;base64,${source.toString("base64")}`;
  await page.setViewportSize({ width: 640, height: 400 });
  await page.setContent(
    `<style>*{box-sizing:border-box}html,body{margin:0;width:640px;height:400px;overflow:hidden;background:transparent}img{position:absolute;width:1536px;height:1024px;left:-570px;top:-315px}</style><img src="${sourceUri}">`,
    { waitUntil: "load" },
  );
  await page.screenshot({ path: outputPath, type: "png" });
}

async function renderBootEditTarget(page, sourcePath, outputPath) {
  const source = await readFile(sourcePath);
  const sourceUri = `data:image/png;base64,${source.toString("base64")}`;
  await page.setViewportSize({ width: 640, height: 400 });
  await page.setContent(
    `<style>*{box-sizing:border-box}html,body{margin:0;width:640px;height:400px;overflow:hidden;background:transparent}img{position:absolute;width:1536px;height:1024px;left:-60px;top:-590px}</style><img src="${sourceUri}">`,
    { waitUntil: "load" },
  );
  await page.screenshot({ path: outputPath, type: "png" });
}

async function main() {
  await mkdir(join(outputRoot, "assets"), { recursive: true });
  await mkdir(join(outputRoot, "output"), { recursive: true });
  const compiled = compilePullScene(maeRig, pageSpec);
  const proof = await buildSingleActorPullProof(compiled.rapierInput);
  const proofSvg = renderPhysicsPoseProofSvg(proof);
  const guideSvg = renderPlantGuideSvg(compiled);

  await Promise.all([
    writeFile(
      join(outputRoot, "mae-rig.json"),
      `${JSON.stringify(maeRig, null, 2)}\n`,
    ),
    writeFile(
      join(outputRoot, "page-spec.json"),
      `${JSON.stringify(pageSpec, null, 2)}\n`,
    ),
    writeFile(
      join(outputRoot, "compiled-scene.json"),
      `${JSON.stringify(compiled, null, 2)}\n`,
    ),
    writeFile(
      join(outputRoot, "output", "physics-proof.json"),
      `${JSON.stringify(proof, null, 2)}\n`,
    ),
    writeFile(join(outputRoot, "output", "physics-proof.svg"), proofSvg),
    writeFile(
      join(outputRoot, "output", "plant-generation-guide.svg"),
      guideSvg,
    ),
  ]);

  const executablePath = await findChromiumExecutable();
  const browser = await chromium.launch({ executablePath, headless: true });
  let composition = null;
  let contactFixedComposition = null;
  try {
    const page = await browser.newPage({
      viewport: { width: 1_536, height: 1_024 },
      deviceScaleFactor: 1,
    });
    await renderSvg(
      page,
      guideSvg,
      join(outputRoot, "output", "plant-generation-guide.png"),
    );

    await page.setViewportSize({ width: 1_400, height: 900 });
    await page.setContent(
      `<style>*{box-sizing:border-box}html,body{margin:0;width:1400px;height:900px;overflow:hidden}</style>${proofSvg}`,
      { waitUntil: "load" },
    );
    await page.screenshot({
      path: join(outputRoot, "output", "physics-proof.png"),
      type: "png",
    });

    const gripInteractionEditBytes = await readFile(
      resolve(gripInteractionEditSource),
    );
    await renderTransparentSvg(
      page,
      renderGripInteractionPatchSvg(gripInteractionEditBytes),
      resolve(gripInteractionPatchSource),
    );
    const bootInteractionEditBytes = await readFile(
      resolve(bootInteractionEditSource),
    );
    await renderTransparentSvg(
      page,
      renderBootInteractionPatchSvg(bootInteractionEditBytes),
      resolve(bootInteractionPatchSource),
    );

    try {
      await access(resolve(plantModuleSource));
      const baseLayers = [
        {
          type: "bitmap",
          id: "garden-background",
          source: gardenBackgroundSource,
          x: 0,
          y: 0,
          width: pageSpec.page.width,
          height: pageSpec.page.height,
          anchorX: 0,
          anchorY: 0,
          fit: "cover",
          requireAlpha: false,
        },
        ...compiled.pageCoordinates.feet.map((foot, index) => ({
          type: "ellipse",
          id: `mae-foot-shadow-${index + 1}`,
          cx: foot.x,
          cy: foot.y + 7,
          rx: 86,
          ry: 18,
          fill: "#4b3426",
          opacity: 0.2,
          blur: 9,
        })),
        {
          type: "bitmap",
          id: "plant-interaction-module",
          source: plantModuleSource,
          x: 0,
          y: 0,
          width: pageSpec.page.width,
          height: pageSpec.page.height,
          anchorX: 0,
          anchorY: 0,
          fit: "stretch",
          requireAlpha: true,
        },
        {
          type: "bitmap",
          id: "mae-approved-pull",
          source: maeRig.asset.source,
          x: pageSpec.characterPlacement.left,
          y: pageSpec.characterPlacement.top,
          width: pageSpec.characterPlacement.width,
          anchorX: 0,
          anchorY: 0,
          fit: "contain",
          requireAlpha: true,
        },
      ];
      composition = await composeLayeredScene(
        {
          id: "turnip-final-pipeline-poc",
          title:
            "Mae pulls a deeply buried turnip with the leafy tops facing her.",
          width: pageSpec.page.width,
          height: pageSpec.page.height,
          layers: baseLayers,
        },
        assetRoot,
      );
      await writeFile(
        join(outputRoot, "output", "final-page.svg"),
        composition.svg,
      );
      await renderSvg(
        page,
        composition.svg,
        join(outputRoot, "output", "final-page.png"),
      );
      await renderGripEditTarget(
        page,
        join(outputRoot, "output", "final-page.png"),
        join(outputRoot, "output", "grip-edit-target.png"),
      );
      await renderBootEditTarget(
        page,
        join(outputRoot, "output", "final-page.png"),
        join(outputRoot, "output", "boot-edit-target.png"),
      );

      contactFixedComposition = await composeLayeredScene(
        {
          id: "turnip-final-pipeline-contact-fixed-v5",
          title:
            "Mae grips a deeply buried turnip with localized grip and ground-contact interaction patches.",
          width: pageSpec.page.width,
          height: pageSpec.page.height,
          layers: [
            ...baseLayers,
            {
              type: "bitmap",
              id: "mae-grip-interaction-patch",
              source: gripInteractionPatchSource,
              x: 0,
              y: 0,
              width: pageSpec.page.width,
              height: pageSpec.page.height,
              anchorX: 0,
              anchorY: 0,
              fit: "stretch",
              requireAlpha: true,
            },
            {
              type: "bitmap",
              id: "mae-boot-ground-interaction-patch",
              source: bootInteractionPatchSource,
              x: 0,
              y: 0,
              width: pageSpec.page.width,
              height: pageSpec.page.height,
              anchorX: 0,
              anchorY: 0,
              fit: "stretch",
              requireAlpha: true,
            },
          ],
        },
        assetRoot,
      );
      await writeFile(
        join(outputRoot, "output", "final-page-contact-fixed-v5.svg"),
        contactFixedComposition.svg,
      );
      const contactFixedPagePath = join(
        outputRoot,
        "output",
        "final-page-contact-fixed-v5.png",
      );
      await renderSvg(page, contactFixedComposition.svg, contactFixedPagePath);
      await renderGripComparison(
        page,
        join(outputRoot, "output", "final-page.png"),
        contactFixedPagePath,
        join(outputRoot, "output", "grip-contact-comparison.png"),
      );
      await renderBootComparison(
        page,
        join(outputRoot, "output", "final-page.png"),
        contactFixedPagePath,
        join(outputRoot, "output", "boot-depth-comparison.png"),
      );
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  } finally {
    await browser.close();
  }

  const sourceHashes = {};
  for (const source of [maeRig.asset.source, gardenBackgroundSource]) {
    const bytes = await readFile(resolve(source));
    sourceHashes[source] = sha256(bytes);
  }

  await writeFile(
    join(outputRoot, "output", "pipeline-report.json"),
    `${JSON.stringify(
      {
        schemaVersion: 1,
        compiledFrom: ["mae-rig.json", "page-spec.json"],
        physicsPassed: proof.passed,
        physicsChecks: proof.checks,
        sourceHashes,
        composedAssets:
          contactFixedComposition?.assets ?? composition?.assets ?? [],
        finalPageRendered: contactFixedComposition !== null,
        depthCorrection: contactFixedComposition
          ? {
              successor: "output/final-page-contact-fixed-v5.png",
              supersedesForReview: "output/final-page.png",
              occluders: [
                { id: "mae-grip-interaction-patch", clipPaths: null },
                { id: "mae-boot-ground-interaction-patch", clipPaths: null },
              ],
              layerOrder: [
                "garden-background",
                "mae-foot-shadows",
                "plant-interaction-module",
                "mae-approved-pull",
                "mae-grip-interaction-patch",
                "mae-boot-ground-interaction-patch",
              ],
            }
          : null,
        unresolvedReview: contactFixedComposition
          ? [
              "Visually inspect hand/stalk occlusion, plant topology, contrast, and seams before acceptance.",
            ]
          : [
              `Generate ${plantModuleSource} from output/plant-generation-guide.png, then rerun this script.`,
            ],
      },
      null,
      2,
    )}\n`,
  );

  console.log(
    JSON.stringify(
      {
        outputRoot,
        physicsPassed: proof.passed,
        finalPageRendered: contactFixedComposition !== null,
        grip: compiled.pageCoordinates.grip,
        crown: compiled.pageCoordinates.crown,
        leafTips: compiled.pageCoordinates.leafTips,
      },
      null,
      2,
    ),
  );
}

await main();
