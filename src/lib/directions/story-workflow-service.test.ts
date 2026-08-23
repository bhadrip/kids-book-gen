import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { FixtureTextProvider } from "@/lib/directions/fixture-text-provider";
import { StoryWorkflowService } from "@/lib/directions/story-workflow-service";
import type { TextProvider } from "@/lib/directions/text-provider";
import { FileProjectRepository } from "@/lib/projects/file-project-repository";
import {
  projectBriefSchema,
  selectedDirectionSchema,
  storyDecisionSchema,
  storyDirectionsSchema,
  storyPackageSchema,
  storyQualityEvaluationSchema,
  textGenerationJobSchema,
} from "@/lib/projects/project";

const directories: string[] = [];
const projectId = "4a2b8437-2e5d-492d-885b-4f1052d4da88";
const now = () => new Date("2026-07-20T12:00:00.000Z");

afterEach(async () => {
  await Promise.all(
    directories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true })),
  );
});

async function setup() {
  const directory = await mkdtemp(join(tmpdir(), "kids-book-workflow-"));
  directories.push(directory);
  const repository = new FileProjectRepository(directory, {
    now,
    createId: () => projectId,
  });
  await repository.create({ title: "Moon Kite" });
  return {
    repository,
    service: new StoryWorkflowService(
      repository,
      new FixtureTextProvider(now),
      now,
    ),
  };
}

describe("StoryWorkflowService", () => {
  it("keeps a legacy brief readable but blocks generation until reader details are confirmed", async () => {
    const { service } = await setup();
    const legacyBrief = projectBriefSchema.parse({
      schemaVersion: 1,
      projectId,
      template: "start_from_scratch",
      originalIdea: "A legacy moon kite story.",
      createdAt: now().toISOString(),
    });

    expect(legacyBrief.readerConfiguration).toBeUndefined();
    await expect(service.createDirections(legacyBrief)).rejects.toThrow(
      "Confirm reader age and reading mode",
    );
  });

  it("preserves direction revisions and generates, revises, and approves a story", async () => {
    const { repository, service } = await setup();
    const brief = projectBriefSchema.parse({
      schemaVersion: 1,
      projectId,
      template: "start_from_scratch",
      originalIdea: "A moon kite flies away.",
      mustKeep: "Keep the moon kite.",
      readerConfiguration: { age: 8, readingMode: "parent_read_aloud" },
      createdAt: now().toISOString(),
    });
    await service.createDirections(brief);
    const revisedDirections = await service.reviseDirections(
      projectId,
      "Make it funnier",
    );
    expect(revisedDirections.revision).toBe(2);
    await expect(
      repository.readArtifact(
        projectId,
        "directions-01.json",
        storyDirectionsSchema,
      ),
    ).resolves.toMatchObject({ revision: 1 });

    const story = await service.selectDirection(
      projectId,
      revisedDirections.directions[0].title,
      "Keep the ending hopeful",
    );
    expect(story.spreads).toHaveLength(13);
    const revised = await service.decideStory(
      projectId,
      "revision_requested",
      "Add one silly obstacle",
    );
    expect(revised.story.revision).toBe(2);
    await service.decideStory(projectId, "approved");

    await expect(
      repository.readArtifact(
        projectId,
        "text-generation-job.json",
        textGenerationJobSchema,
      ),
    ).resolves.toMatchObject({
      kind: "story_revision",
      status: "completed",
      lastSavedArtifact: "story.json",
    });

    await expect(
      repository.readArtifact(projectId, "story-01.json", storyPackageSchema),
    ).resolves.toMatchObject({ revision: 1 });
    await expect(
      repository.readArtifact(
        projectId,
        "story-decision.json",
        storyDecisionSchema,
      ),
    ).resolves.toMatchObject({ status: "approved", storyRevision: 2 });
  });

  it("preserves the brief and selected direction when a provider fails", async () => {
    const { repository, service } = await setup();
    const brief = projectBriefSchema.parse({
      schemaVersion: 1,
      projectId,
      template: "start_from_scratch",
      originalIdea: "A moon kite flies away.",
      readerConfiguration: { age: 8, readingMode: "parent_read_aloud" },
      createdAt: now().toISOString(),
    });
    const directions = await service.createDirections(brief);
    const unavailableProvider: TextProvider = {
      generateDirections: async () => {
        throw new Error("provider unavailable");
      },
      generateStory: async () => {
        throw new Error("provider unavailable");
      },
      evaluateStory: async () => {
        throw new Error("provider unavailable");
      },
      generateVisualPlan: async () => {
        throw new Error("provider unavailable");
      },
    };
    const unavailableService = new StoryWorkflowService(
      repository,
      unavailableProvider,
      now,
    );

    await expect(
      unavailableService.selectDirection(
        projectId,
        directions.directions[0].title,
      ),
    ).rejects.toThrow("provider unavailable");
    await expect(
      repository.readArtifact(projectId, "brief.json", projectBriefSchema),
    ).resolves.toMatchObject({ originalIdea: "A moon kite flies away." });
    await expect(
      repository.readArtifact(
        projectId,
        "selected-direction.json",
        selectedDirectionSchema,
      ),
    ).resolves.toMatchObject({
      directionTitle: directions.directions[0].title,
    });
    await expect(
      repository.readArtifact(
        projectId,
        "text-generation-job.json",
        textGenerationJobSchema,
      ),
    ).resolves.toMatchObject({
      kind: "story",
      status: "failed",
      lastSavedArtifact: "selected-direction.json",
    });
  });

  it("runs one hidden evaluation and at most one automatic revision", async () => {
    const { repository, service } = await setup();
    const brief = projectBriefSchema.parse({
      schemaVersion: 1,
      projectId,
      template: "start_from_scratch",
      originalIdea: "Fixture story needs one quality revision",
      readerConfiguration: { age: 5, readingMode: "co_read" },
      createdAt: now().toISOString(),
    });
    const directions = await service.createDirections(brief);
    const story = await service.selectDirection(
      projectId,
      directions.directions[0].title,
    );

    expect(story.revision).toBe(1);
    expect(story.arc.middle).toContain("clear");
    await expect(
      repository.readArtifact(
        projectId,
        "story-quality-evaluation-01.json",
        storyQualityEvaluationSchema,
      ),
    ).resolves.toMatchObject({ verdict: "revise" });
    await expect(
      repository.readArtifact(
        projectId,
        "story-quality-input-01.json",
        storyPackageSchema,
      ),
    ).resolves.not.toMatchObject({ arc: { middle: story.arc.middle } });
  });
});
