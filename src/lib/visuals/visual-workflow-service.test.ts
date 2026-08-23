import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { FileCharacterLibraryRepository } from "@/lib/characters/file-character-library-repository";
import { FixtureTextProvider } from "@/lib/directions/fixture-text-provider";
import { StoryWorkflowService } from "@/lib/directions/story-workflow-service";
import { FileProjectRepository } from "@/lib/projects/file-project-repository";
import {
  projectBriefSchema,
  storyDecisionSchema,
} from "@/lib/projects/project";
import { FixtureImageProvider } from "@/lib/visuals/fixture-image-provider";
import {
  imageGenerationJobSchema,
  sampleSpreadSchema,
  selectedCharacterSchema,
  visualBibleSchema,
  visualDecisionSchema,
} from "@/lib/visuals/visual-artifacts";
import { VisualNarrativeWorkflowService } from "@/lib/visuals/visual-narrative-workflow-service";
import { VisualWorkflowService } from "@/lib/visuals/visual-workflow-service";

const directories: string[] = [];
const projectId = "4a2b8437-2e5d-492d-885b-4f1052d4da88";
const now = () => new Date("2026-07-21T12:00:00.000Z");

afterEach(async () => {
  await Promise.all(
    directories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true })),
  );
});

async function setup(options?: {
  approveStory?: boolean;
  imageFailure?: boolean;
}) {
  const directory = await mkdtemp(join(tmpdir(), "kids-book-visuals-"));
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
  if (options?.approveStory !== false)
    await storyService.decideStory(projectId, "approved");
  if (options?.approveStory !== false) {
    const narrativeService = new VisualNarrativeWorkflowService(
      repository,
      new FixtureTextProvider(now),
      now,
    );
    await narrativeService.generatePlan(projectId);
    await narrativeService.decidePlan(projectId, "approved");
  }
  const characterLibrary = new FileCharacterLibraryRepository(
    join(directory, "characters"),
  );
  return {
    repository,
    characterLibrary,
    service: new VisualWorkflowService(
      repository,
      characterLibrary,
      new FixtureImageProvider(0, options?.imageFailure),
      now,
      () => "b1cc96a2-889b-4505-ab04-1e9bc69a12e5",
    ),
  };
}

describe("VisualWorkflowService", () => {
  it("persists three designs, the selected reference, visual bible, sample, and approval", async () => {
    const { repository, characterLibrary, service } = await setup();

    const designs = await service.generateCharacterDesigns(
      projectId,
      "warm_handmade_v1",
    );
    expect(designs.options).toHaveLength(3);
    const sample = await service.selectCharacterAndGenerateSample(
      projectId,
      "character-2",
    );
    expect(sample.spreadNumber).toBe(7);
    const { decision } = await service.decideVisual(projectId, "approved");
    expect(decision).toMatchObject({ status: "approved", sampleRevision: 1 });

    const selected = await repository.readArtifact(
      projectId,
      "selected-character.json",
      selectedCharacterSchema,
    );
    await expect(
      repository.readAsset(projectId, selected.referenceAssetFilename),
    ).resolves.toEqual(
      await repository.readAsset(projectId, selected.sourceAssetFilename),
    );
    expect(await characterLibrary.list()).toMatchObject([
      {
        displayName: "Milo",
        status: "approved",
        visibility: "private",
        rendition: { presetId: "warm_handmade_v1" },
      },
    ]);
    await expect(
      repository.readArtifact(
        projectId,
        "visual-bible.json",
        visualBibleSchema,
      ),
    ).resolves.toMatchObject({
      presetId: "warm_handmade_v1",
      characterReference: selected.referenceAssetFilename,
    });
    await expect(
      repository.readArtifact(
        projectId,
        "visual-decision.json",
        visualDecisionSchema,
      ),
    ).resolves.toMatchObject({ status: "approved" });
    await expect(
      repository.readArtifact(
        projectId,
        "image-generation-job.json",
        imageGenerationJobSchema,
      ),
    ).resolves.toMatchObject({ status: "completed", kind: "sample_spread" });
  });

  it("preserves the chosen character and prior sample when revising only the sample", async () => {
    const { repository, service } = await setup();
    await service.generateCharacterDesigns(projectId, "bold_funny_v1");
    await service.selectCharacterAndGenerateSample(projectId, "character-1");
    const selectedBefore = await repository.readArtifact(
      projectId,
      "selected-character.json",
      selectedCharacterSchema,
    );

    const revised = await service.decideVisual(
      projectId,
      "change_requested",
      "Make the moon kite larger; keep Milo exactly the same.",
    );

    expect(revised.sample).toMatchObject({
      revision: 2,
      parentFeedback: "Make the moon kite larger; keep Milo exactly the same.",
    });
    await expect(
      repository.readArtifact(
        projectId,
        "sample-spread-01.json",
        sampleSpreadSchema,
      ),
    ).resolves.toMatchObject({ revision: 1 });
    await expect(
      repository.readArtifact(
        projectId,
        "selected-character.json",
        selectedCharacterSchema,
      ),
    ).resolves.toEqual(selectedBefore);
  });

  it("requires story approval and preserves it after an image-provider failure", async () => {
    const unapproved = await setup({ approveStory: false });
    await expect(
      unapproved.service.generateCharacterDesigns(
        projectId,
        "magical_luminous_v1",
      ),
    ).rejects.toThrow("Approve the current story");

    const failing = await setup({ imageFailure: true });
    await expect(
      failing.service.generateCharacterDesigns(
        projectId,
        "magical_luminous_v1",
      ),
    ).rejects.toThrow("fixture image failure");
    await expect(
      failing.repository.readArtifact(
        projectId,
        "story-decision.json",
        storyDecisionSchema,
      ),
    ).resolves.toMatchObject({ status: "approved" });
    await expect(
      failing.repository.readArtifact(
        projectId,
        "image-generation-job.json",
        imageGenerationJobSchema,
      ),
    ).resolves.toMatchObject({
      status: "failed",
      lastSavedArtifact: "story-decision.json",
    });
  });

  it("requires exact visual-plan approval before character generation", async () => {
    const { repository, service } = await setup();
    await repository.writeArtifact(projectId, "visual-plan-decision.json", {
      schemaVersion: 1,
      projectId,
      spreadMapRevision: 1,
      status: "change_requested",
      feedback: "Try again.",
      decidedAt: now().toISOString(),
    });

    await expect(
      service.generateCharacterDesigns(projectId, "warm_handmade_v1"),
    ).rejects.toThrow("Approve the current visual story plan");
  });
});
