import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { FixtureTextProvider } from "@/lib/directions/fixture-text-provider";
import { StoryWorkflowService } from "@/lib/directions/story-workflow-service";
import { FileProjectRepository } from "@/lib/projects/file-project-repository";
import { projectBriefSchema } from "@/lib/projects/project";
import {
  BudgetConfirmationRequiredError,
  BookProductionService,
} from "@/lib/production/book-production-service";
import {
  requiredBookPageIds,
  runBookPreflight,
} from "@/lib/production/book-preflight";
import {
  bookPageSchema,
  bookPreflightSchema,
  bookProductionJobSchema,
} from "@/lib/production/production-artifacts";
import { FixtureImageProvider } from "@/lib/visuals/fixture-image-provider";
import type { ImageProvider } from "@/lib/visuals/image-provider";
import { VisualWorkflowService } from "@/lib/visuals/visual-workflow-service";

const directories: string[] = [];
const projectId = "4a2b8437-2e5d-492d-885b-4f1052d4da88";
const now = () => new Date("2026-07-22T12:00:00.000Z");

afterEach(async () => {
  await Promise.all(
    directories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true })),
  );
});

class RecordingImageProvider extends FixtureImageProvider {
  public readonly productionInputs: Array<
    Parameters<ImageProvider["generateBookPage"]>[0]
  > = [];

  public constructor(private readonly failAt?: string) {
    super();
  }

  public override async generateBookPage(
    input: Parameters<ImageProvider["generateBookPage"]>[0],
  ) {
    this.productionInputs.push(input);
    if (input.pageId === this.failAt)
      throw new Error("A controlled production interruption.");
    return super.generateBookPage(input);
  }
}

async function setup(provider: ImageProvider = new FixtureImageProvider()) {
  const directory = await mkdtemp(join(tmpdir(), "kids-book-production-"));
  directories.push(directory);
  const repository = new FileProjectRepository(directory, {
    now,
    createId: () => projectId,
  });
  await repository.create({ title: "Moon Kite" });
  const storyService = new StoryWorkflowService(
    repository,
    new FixtureTextProvider(now),
    now,
  );
  const brief = projectBriefSchema.parse({
    schemaVersion: 1,
    projectId,
    template: "start_from_scratch",
    originalIdea: "A moon kite flies away before bedtime.",
    protagonist: "Milo",
    mustKeep: "Keep Milo's round glasses and the silver moon kite.",
    createdAt: now().toISOString(),
  });
  const directions = await storyService.createDirections(brief);
  await storyService.selectDirection(projectId, directions.directions[0].title);
  await storyService.decideStory(projectId, "approved");
  const visualService = new VisualWorkflowService(
    repository,
    new FixtureImageProvider(),
    now,
  );
  await visualService.generateCharacterDesigns(projectId, "warm_handmade_v1");
  await visualService.selectCharacterAndGenerateSample(
    projectId,
    "character-1",
  );
  await visualService.decideVisual(projectId, "approved");
  return {
    repository,
    service: new BookProductionService(repository, provider, now, {
      softBudgetUsd: 3,
      finalImageEstimateUsd: 0.18,
    }),
  };
}

describe("BookProductionService", () => {
  it("generates 16 required pages sequentially with references and continuity facts", async () => {
    const provider = new RecordingImageProvider();
    const { repository, service } = await setup(provider);

    const job = await service.startOrResume(projectId);

    expect(job).toMatchObject({
      status: "completed",
      completedUnitIds: requiredBookPageIds,
      estimatedSpentCostUsd: 2.88,
    });
    expect(provider.productionInputs.map((input) => input.pageId)).toEqual(
      requiredBookPageIds,
    );
    expect(
      provider.productionInputs[0]?.reference.bytes.byteLength,
    ).toBeGreaterThan(0);
    expect(provider.productionInputs[2]).toMatchObject({
      pageId: "story-01",
      storySpreadNumber: 1,
      continuityFacts: expect.arrayContaining([
        expect.stringContaining("Current beat"),
        expect.stringContaining("silver moon kite"),
      ]),
      requiredReferenceDetails: expect.arrayContaining([
        expect.stringContaining("facial features"),
      ]),
    });
    expect(
      provider.productionInputs[2]?.previousReference?.bytes.byteLength,
    ).toBeGreaterThan(0);
    await expect(
      repository.readArtifact(
        projectId,
        "book-preflight.json",
        bookPreflightSchema,
      ),
    ).resolves.toMatchObject({ status: "passed", issues: [] });
  });

  it("resumes after an interrupted page without regenerating saved predecessors", async () => {
    const failingProvider = new RecordingImageProvider("story-04");
    const { repository, service } = await setup(failingProvider);

    await expect(service.startOrResume(projectId)).rejects.toThrow(
      "controlled production interruption",
    );
    const coverBefore = await repository.readArtifact(
      projectId,
      "book-page-cover.json",
      bookPageSchema,
    );
    const interruptedJob = await repository.readArtifact(
      projectId,
      "book-production-job.json",
      bookProductionJobSchema,
    );
    expect(interruptedJob).toMatchObject({
      status: "failed",
      failedUnitId: "story-04",
      completedUnitIds: [
        "cover",
        "title-page",
        "story-01",
        "story-02",
        "story-03",
      ],
    });
    await repository.writeArtifact(
      projectId,
      "book-production-job.json",
      bookProductionJobSchema.parse({
        ...interruptedJob,
        status: "in_progress",
        stage: "Creating story spread 4",
        currentUnitId: "story-04",
        failedUnitId: undefined,
        failureMessage: undefined,
      }),
    );

    const resumedProvider = new RecordingImageProvider();
    const resumed = new BookProductionService(
      repository,
      resumedProvider,
      now,
      { softBudgetUsd: 3, finalImageEstimateUsd: 0.18 },
    );
    const completed = await resumed.startOrResume(projectId);

    expect(completed.status).toBe("completed");
    expect(resumedProvider.productionInputs[0]?.pageId).toBe("story-04");
    await expect(
      repository.readArtifact(
        projectId,
        "book-page-cover.json",
        bookPageSchema,
      ),
    ).resolves.toEqual(coverBefore);
    expect(completed.activity.map((event) => event.type)).toEqual(
      expect.arrayContaining(["failed", "resumed", "preflight_completed"]),
    );
  });

  it("enforces explicit confirmation before a projected estimate exceeds five dollars", async () => {
    const { repository } = await setup();
    const expensive = new BookProductionService(
      repository,
      new FixtureImageProvider(),
      now,
      { softBudgetUsd: 3, finalImageEstimateUsd: 0.4 },
    );

    await expect(expensive.startOrResume(projectId)).rejects.toBeInstanceOf(
      BudgetConfirmationRequiredError,
    );
    await expect(
      expensive.startOrResume(projectId, true),
    ).resolves.toMatchObject({
      status: "completed",
      overFiveConfirmed: true,
      estimatedSpentCostUsd: 6.4,
    });
  });

  it("regenerates only one page and preserves approved siblings and prior revisions", async () => {
    const { repository, service } = await setup();
    await service.startOrResume(projectId);
    const siblingBefore = await repository.readArtifact(
      projectId,
      "book-page-story-06.json",
      bookPageSchema,
    );
    const selectedBefore = await repository.readArtifact(
      projectId,
      "book-page-story-07.json",
      bookPageSchema,
    );

    const regenerated = await service.regeneratePage(
      projectId,
      "story-07",
      "Make the kite larger in the sky.",
      "Keep Milo, the round glasses, and the page text exactly the same.",
    );

    expect(regenerated).toMatchObject({
      revision: 2,
      text: selectedBefore.text,
      parentFeedback: "Make the kite larger in the sky.",
    });
    await expect(
      repository.readArtifact(
        projectId,
        "book-page-story-07-r01.json",
        bookPageSchema,
      ),
    ).resolves.toEqual(selectedBefore);
    await expect(
      repository.readArtifact(
        projectId,
        "book-page-story-06.json",
        bookPageSchema,
      ),
    ).resolves.toEqual(siblingBefore);
  });

  it("reports missing, empty-text, reference, and continuity preflight failures", () => {
    const pages = requiredBookPageIds.slice(0, 2).map((pageId) => ({
      pageId,
      text: " ",
      characterReference: "",
      requiredReferenceDetails: [],
      continuityFacts: [],
    }));

    const report = runBookPreflight({
      projectId,
      checkedAt: now().toISOString(),
      pages,
    });

    expect(report.status).toBe("failed");
    expect(report.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        "missing_page",
        "empty_text",
        "missing_character_reference",
        "missing_reference_details",
        "missing_continuity_facts",
      ]),
    );
  });
});
