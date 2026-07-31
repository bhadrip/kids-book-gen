import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { FixtureTextProvider } from "@/lib/directions/fixture-text-provider";
import { StoryWorkflowService } from "@/lib/directions/story-workflow-service";
import { FileProjectRepository } from "@/lib/projects/file-project-repository";
import { projectBriefSchema } from "@/lib/projects/project";
import {
  emotionalArcSchema,
  spreadMapSchema,
  visualPlanDecisionSchema,
  visualPlanJobSchema,
} from "@/lib/visuals/visual-narrative-artifacts";
import { VisualNarrativeWorkflowService } from "@/lib/visuals/visual-narrative-workflow-service";

const directories: string[] = [];
const projectId = "5609deda-ff5b-4090-9865-c390e164d11c";
const now = () => new Date("2026-07-30T12:00:00.000Z");

afterEach(async () => {
  await Promise.all(
    directories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true })),
  );
});

async function setup(originalIdea = "A moon kite flies away before bedtime.") {
  const directory = await mkdtemp(join(tmpdir(), "kids-book-visual-plan-"));
  directories.push(directory);
  const repository = new FileProjectRepository(directory, {
    now,
    createId: () => projectId,
  });
  await repository.create({ title: "Moon Kite" });
  const provider = new FixtureTextProvider(now);
  const storyService = new StoryWorkflowService(repository, provider, now);
  const brief = projectBriefSchema.parse({
    schemaVersion: 1,
    projectId,
    template: "start_from_scratch",
    originalIdea,
    protagonist: "Milo",
    avoid: "Do not make Milo feel blamed.",
    mustKeep: "Keep Milo's round glasses and the silver moon kite.",
    createdAt: now().toISOString(),
  });
  const directions = await storyService.createDirections(brief);
  await storyService.selectDirection(projectId, directions.directions[0].title);
  await storyService.decideStory(projectId, "approved");
  return {
    repository,
    service: new VisualNarrativeWorkflowService(repository, provider, now),
  };
}

describe("VisualNarrativeWorkflowService", () => {
  it("persists a complete paired plan and exact approval", async () => {
    const { repository, service } = await setup();

    const plan = await service.generatePlan(projectId);
    expect(plan.spreadMap.spreads).toHaveLength(13);
    expect(plan.spreadMap.spreads.map((spread) => spread.spreadNumber)).toEqual(
      Array.from({ length: 13 }, (_, index) => index + 1),
    );
    expect(plan.emotionalArc.characters[0]?.beats).toHaveLength(13);

    const { decision } = await service.decidePlan(projectId, "approved");
    expect(decision).toMatchObject({
      status: "approved",
      spreadMapRevision: 1,
    });
    await expect(
      repository.readArtifact(
        projectId,
        "visual-plan-decision.json",
        visualPlanDecisionSchema,
      ),
    ).resolves.toEqual(decision);
    await expect(
      repository.readArtifact(
        projectId,
        "visual-plan-job.json",
        visualPlanJobSchema,
      ),
    ).resolves.toMatchObject({
      status: "completed",
      lastSavedArtifact: "spread-map.json",
    });
  });

  it("preserves the prior pair when parent feedback creates a successor", async () => {
    const { repository, service } = await setup();
    await service.generatePlan(projectId);

    const result = await service.decidePlan(
      projectId,
      "change_requested",
      "Make spread 7 feel quieter while preserving Milo's choice.",
    );

    expect(result.spreadMap).toMatchObject({
      revision: 2,
      parentSteering:
        "Make spread 7 feel quieter while preserving Milo's choice.",
    });
    await expect(
      repository.readArtifact(
        projectId,
        "emotional-arc-01.json",
        emotionalArcSchema,
      ),
    ).resolves.toMatchObject({ revision: 1 });
    await expect(
      repository.readArtifact(projectId, "spread-map-01.json", spreadMapSchema),
    ).resolves.toMatchObject({ revision: 1 });
  });

  it("preserves the approved story and records a recoverable provider failure", async () => {
    const { repository, service } = await setup("Fixture visual plan failure");

    await expect(service.generatePlan(projectId)).rejects.toThrow(
      "fixture visual-plan failure",
    );
    await expect(
      repository.readArtifact(
        projectId,
        "visual-plan-job.json",
        visualPlanJobSchema,
      ),
    ).resolves.toMatchObject({
      status: "failed",
      lastSavedArtifact: "story-decision.json",
    });
  });
});
