import { access, mkdir, readdir, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

import { chromium } from "playwright";

import { buildAllPhysicsPoseProofs } from "../src/lib/illustration-physics/rapier-pose-proof.ts";
import { renderPhysicsPoseProofSvg } from "../src/lib/illustration-physics/physics-proof-svg.ts";

const outputRoot = resolve(
  "data/prototypes/rapier-illustration-physics/output",
);

async function findChromiumExecutable() {
  const configured = chromium.executablePath();
  try {
    await access(configured);
    return configured;
  } catch {
    // The workspace may have a newer shared Playwright browser than this package expects.
  }

  const cacheRoot = join(homedir(), "Library/Caches/ms-playwright");
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
        // Continue to the next installed browser candidate.
      }
    }
  }
  throw new Error("No compatible Playwright Chromium executable was found.");
}

async function main() {
  await mkdir(outputRoot, { recursive: true });
  const proofs = await buildAllPhysicsPoseProofs();
  const executablePath = await findChromiumExecutable();
  const browser = await chromium.launch({ executablePath, headless: true });
  const rendered = [];

  try {
    const page = await browser.newPage({
      viewport: { width: 1400, height: 900 },
      deviceScaleFactor: 1,
    });
    for (const [index, proof] of proofs.entries()) {
      const prefix = `${String(index + 1).padStart(2, "0")}-${proof.id}`;
      const svg = renderPhysicsPoseProofSvg(proof);
      rendered.push({ proof, svg });
      await writeFile(join(outputRoot, `${prefix}.svg`), svg);
      await page.setContent(
        `<style>*{box-sizing:border-box}html,body{margin:0;width:1400px;height:900px;overflow:hidden}</style>${svg}`,
        { waitUntil: "load" },
      );
      await page.screenshot({
        path: join(outputRoot, `${prefix}.png`),
        type: "png",
      });
    }

    const thumbnails = rendered
      .map(({ proof, svg }) => {
        return `<figure><div class="proof">${svg}</div><figcaption>${proof.title}</figcaption></figure>`;
      })
      .join("");
    await page.setViewportSize({ width: 1500, height: 1050 });
    await page.setContent(
      `<style>
        *{box-sizing:border-box} body{margin:0;padding:36px;background:#ebe8df;font-family:system-ui,sans-serif}
        h1{margin:0 0 24px;color:#31433f;font-size:28px} .grid{display:grid;grid-template-columns:1fr 1fr;gap:24px}
        figure{margin:0;background:#fff;border-radius:16px;padding:12px;box-shadow:0 8px 28px #44534b26} figure:last-child{grid-column:1 / -1;width:calc(50% - 12px);justify-self:center}
        .proof{overflow:hidden;border-radius:9px}.proof svg{display:block;width:100%;height:auto} figcaption{padding:10px 4px 2px;font-weight:700;color:#4b5d56}
      </style><h1>Rapier 2D illustration-physics test cases</h1><div class="grid">${thumbnails}</div>`,
      { waitUntil: "load" },
    );
    await page.screenshot({
      path: join(outputRoot, "00-contact-sheet.png"),
      type: "png",
      fullPage: true,
    });
  } finally {
    await browser.close();
  }

  await writeFile(
    join(outputRoot, "physics-proof-report.json"),
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        passed: proofs.every((proof) => proof.passed),
        proofs,
      },
      null,
      2,
    )}\n`,
  );

  console.log(
    JSON.stringify(
      {
        outputRoot,
        cases: proofs.map((proof) => ({
          id: proof.id,
          passed: proof.passed,
          checks: proof.checks.length,
        })),
      },
      null,
      2,
    ),
  );
}

await main();
