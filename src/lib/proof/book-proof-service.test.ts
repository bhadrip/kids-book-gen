import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { FileCharacterLibraryRepository } from "@/lib/characters/file-character-library-repository";
import { FixtureTextProvider } from "@/lib/directions/fixture-text-provider";
import { StoryWorkflowService } from "@/lib/directions/story-workflow-service";
import { FileProjectRepository } from "@/lib/projects/file-project-repository";
import { projectBriefSchema } from "@/lib/projects/project";
import {
  BookProofService,
  ProofLayoutError,
} from "@/lib/proof/book-proof-service";
import type { PdfRenderer } from "@/lib/proof/pdf-renderer";
import {
  bookProofSchema,
  pilotSummarySchema,
  readingFeedbackSchema,
} from "@/lib/proof/proof-artifacts";
import { BookProductionService } from "@/lib/production/book-production-service";
import { bookPageSchema } from "@/lib/production/production-artifacts";
import { FixtureImageProvider } from "@/lib/visuals/fixture-image-provider";
import { VisualWorkflowService } from "@/lib/visuals/visual-workflow-service";
import { VisualNarrativeWorkflowService } from "@/lib/visuals/visual-narrative-workflow-service";

const directories: string[] = [];
const projectId = "a9ef6d30-f300-4897-bc8f-abda9a9c00b2";
const workflowNow = () => new Date("2026-07-22T12:00:00.000Z");
const proofNow = () => new Date("2026-07-22T12:30:00.000Z");

afterEach(async () => {
  await Promise.all(
    directories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true })),
  );
});

class FixturePdfRenderer implements PdfRenderer {
  public constructor(
    private readonly overflowPageIds: ["story-07"] | [] = [],
  ) {}

  public async render() {
    return {
      bytes: new TextEncoder().encode("%PDF-fixture-proof"),
      renderedPageCount: 16,
      overflowPageIds: this.overflowPageIds,
    };
  }
}

async function setup() {
  const directory = await mkdtemp(join(tmpdir(), "kids-book-proof-"));
  directories.push(directory);
  const repository = new FileProjectRepository(directory, {
    now: workflowNow,
    createId: () => projectId,
  });
  await repository.create({ title: "Moon Kite Proof" });
  const story = new StoryWorkflowService(
    repository,
    new FixtureTextProvider(workflowNow),
    workflowNow,
  );
  const brief = projectBriefSchema.parse({
    schemaVersion: 1,
    projectId,
    template: "start_from_scratch",
    originalIdea: "A moon kite flies away before bedtime.",
    mustKeep: "Keep Milo's glasses and the silver moon kite.",
    readerConfiguration: { age: 8, readingMode: "parent_read_aloud" },
    createdAt: workflowNow().toISOString(),
  });
  const directions = await story.createDirections(brief);
  await story.selectDirection(projectId, directions.directions[0].title);
  await story.decideStory(projectId, "approved");
  const visualNarrative = new VisualNarrativeWorkflowService(
    repository,
    new FixtureTextProvider(workflowNow),
    workflowNow,
  );
  await visualNarrative.generatePlan(projectId);
  await visualNarrative.decidePlan(projectId, "approved");
  const visuals = new VisualWorkflowService(
    repository,
    new FileCharacterLibraryRepository(join(directory, "characters")),
    new FixtureImageProvider(),
    workflowNow,
    () => "c27f9f0b-2df2-4966-99d9-84ec62fc21bb",
  );
  await visuals.generateCharacterDesigns(projectId, "warm_handmade_v1");
  await visuals.selectCharacterAndGenerateSample(projectId, "character-1");
  await visuals.decideVisual(projectId, "approved");
  const production = new BookProductionService(
    repository,
    new FixtureImageProvider(),
    workflowNow,
    { softBudgetUsd: 3, finalImageEstimateUsd: 0.18 },
  );
  await production.approveBookPlan(projectId);
  await production.startOrResume(projectId);
  await production.approveBook(projectId);
  return { repository, production };
}

describe("BookProofService", () => {
  it("uses one complete layout for the reader and PDF, then persists local feedback and summary", async () => {
    const { repository, production } = await setup();
    const service = new BookProofService(
      repository,
      new FixturePdfRenderer(),
      proofNow,
    );

    const reader = await service.prepareReader(projectId);
    expect(reader.pages).toHaveLength(16);
    expect(reader.proof).toMatchObject({
      revision: 1,
      status: "ready",
      layoutStatus: "not_checked",
    });
    const html = await repository.readAsset(projectId, "proof-r01.html");
    expect(html.toString("utf8").match(/data-book-spread=/g)).toHaveLength(16);
    expect(html.toString("utf8")).toContain("book-spread__text--");

    const exported = await service.exportPdf(projectId);
    expect(new TextDecoder().decode(exported.bytes)).toMatch(/^%PDF/);
    await expect(
      repository.readArtifact(projectId, "book-proof.json", bookProofSchema),
    ).resolves.toMatchObject({
      status: "exported",
      layoutStatus: "passed",
      pdfFilename: "proof-r01.pdf",
    });
    expect(
      (await repository.readAsset(projectId, "proof.pdf")).byteLength,
    ).toBeGreaterThan(4);

    const saved = await service.submitFeedback(projectId, {
      favoritePart: "The moon kite finally came home.",
      confusion: "We wondered who opened the window.",
      completion: "finished",
      ideaFidelityRating: 5,
      rereadInterest: "yes",
      sequelInterest: "maybe",
    });
    expect(saved.summary).toMatchObject({
      minutesFromProjectStartToFeedback: 30,
      estimatedBookCostUsd: 2.88,
      ideaFidelityRating: 5,
      readingCompleted: true,
      rereadInterest: "yes",
      sequelInterest: "maybe",
    });
    await expect(
      repository.readArtifact(
        projectId,
        "feedback.json",
        readingFeedbackSchema,
      ),
    ).resolves.toMatchObject({ revision: 1, sourceProofRevision: 1 });
    await expect(
      repository.readArtifact(
        projectId,
        "pilot-summary.json",
        pilotSummarySchema,
      ),
    ).resolves.toEqual(saved.summary);

    await production.editPageText(
      projectId,
      "story-07",
      "A changed text layer makes the exact approval stale.",
    );
    await expect(service.prepareReader(projectId)).rejects.toThrow(
      "A page changed after the last complete-book approval",
    );
    await expect(
      repository.readArtifact(
        projectId,
        "book-page-story-07.json",
        bookPageSchema,
      ),
    ).resolves.toMatchObject({ revision: 2 });
  });

  it("does not save a PDF when Playwright reports an overflowing text layer", async () => {
    const { repository } = await setup();
    const service = new BookProofService(
      repository,
      new FixturePdfRenderer(["story-07"]),
      proofNow,
    );

    await expect(service.exportPdf(projectId)).rejects.toBeInstanceOf(
      ProofLayoutError,
    );
    await expect(
      repository.readArtifact(projectId, "book-proof.json", bookProofSchema),
    ).resolves.toMatchObject({
      status: "ready",
      layoutStatus: "failed",
      layoutIssuePageIds: ["story-07"],
    });
    await expect(
      repository.readAsset(projectId, "proof.pdf"),
    ).rejects.toThrow();
  });
});
