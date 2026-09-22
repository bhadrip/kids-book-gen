import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";

import { compileIllustrationProductionPlan } from "../src/lib/illustration-pipeline/illustration-production-plan.ts";

function readArguments(argv) {
  const values = { input: undefined, output: undefined };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--input") values.input = argv[++index];
    else if (argument === "--output") values.output = argv[++index];
    else throw new Error(`Unknown argument: ${argument}`);
  }
  if (!values.input || !values.output) {
    throw new Error(
      "Usage: pnpm illustration:compile -- --input <plan.json> --output <directory>",
    );
  }
  return values;
}

function renderChecklist(compiled) {
  const pageRows = compiled.pages
    .map(
      (page) =>
        `| ${page.sequence} | ${page.pageId} | ${page.strategy} | ${page.requiresPhysicsProof ? "required" : "not required"} | ${page.generationQueue.length} |`,
    )
    .join("\n");
  return `# Illustration run: ${compiled.bookId}

Run ID: \`${compiled.runId}\`

| Page | ID | Composition | Rapier | Missing units |
| ---: | --- | --- | --- | ---: |
${pageRows}

## Per-page acceptance

- [ ] Approved identity and source lineage remain intact.
- [ ] Contacts, grip wrapping, ground support, burial, and occlusion read naturally.
- [ ] The final raster matches every required Rapier proof.
- [ ] One focal region wins; the background stays compressed and quiet.
- [ ] Character performance matches the declared intensity.
- [ ] Story text is composed deterministically at 4.5:1 contrast or better.
- [ ] Only the smallest failing production unit is revised.

## Whole-book handoff

${compiled.finalReviewHandoffs.map((review) => `- [ ] ${review}`).join("\n")}
`;
}

async function main() {
  const { input, output } = readArguments(process.argv.slice(2));
  const inputPath = resolve(input);
  const outputRoot = resolve(output);
  const raw = JSON.parse(await readFile(inputPath, "utf8"));
  const compiled = compileIllustrationProductionPlan(raw);

  await mkdir(dirname(outputRoot), { recursive: true });
  await mkdir(outputRoot);
  await mkdir(join(outputRoot, "pages"));
  await writeFile(
    join(outputRoot, "compiled-illustration-plan.json"),
    `${JSON.stringify(compiled, null, 2)}\n`,
  );
  await writeFile(
    join(outputRoot, "PRODUCTION-CHECKLIST.md"),
    renderChecklist(compiled),
  );
  await Promise.all(
    compiled.pages.map((page) =>
      writeFile(
        join(
          outputRoot,
          "pages",
          `${String(page.sequence).padStart(2, "0")}-${page.pageId}.json`,
        ),
        `${JSON.stringify(page, null, 2)}\n`,
      ),
    ),
  );

  console.log(
    JSON.stringify(
      {
        input: basename(inputPath),
        outputRoot,
        pages: compiled.pages.length,
        physicsProofsRequired: compiled.pages.filter(
          ({ requiresPhysicsProof }) => requiresPhysicsProof,
        ).length,
        missingUnits: compiled.pages.reduce(
          (total, page) => total + page.generationQueue.length,
          0,
        ),
      },
      null,
      2,
    ),
  );
}

await main();
