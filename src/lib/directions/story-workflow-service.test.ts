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
  storyEvaluationSchema,
  storyPackageSchema,
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
  it("preserves direction revisions and generates, revises, and approves a story", async () => {
    const { repository, service } = await setup();
    const brief = projectBriefSchema.parse({
      schemaVersion: 1,
      projectId,
      template: "start_from_scratch",
      originalIdea: "A moon kite flies away.",
      mustKeep: "Keep the moon kite.",
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
    await expect(
      repository.readArtifact(
        projectId,
        "story-evaluation-01.json",
        storyEvaluationSchema,
      ),
    ).resolves.toMatchObject({ outcome: "pass", storyRevision: 1 });
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
      failureMessage:
        "The AI provider could not complete this step. Your last saved work is safe; retry the step. If it fails again, check the development-server log for the provider error.",
    });
  });

  it("persists a hidden evaluation and performs at most one automatic revision", async () => {
    const { repository } = await setup();
    const service = new StoryWorkflowService(
      repository,
      new FixtureTextProvider(now),
      now,
    );
    const brief = projectBriefSchema.parse({
      schemaVersion: 1,
      projectId,
      template: "start_from_scratch",
      originalIdea: "Fixture story quality revision",
      mustKeep: "Keep the moon kite.",
      createdAt: now().toISOString(),
    });
    const directions = await service.createDirections(brief);

    const story = await service.selectDirection(
      projectId,
      directions.directions[0].title,
    );

    expect(story.revision).toBe(2);
    await expect(
      repository.readArtifact(projectId, "story-01.json", storyPackageSchema),
    ).resolves.toMatchObject({ revision: 1 });
    await expect(
      repository.readArtifact(projectId, "story-02.json", storyPackageSchema),
    ).resolves.toMatchObject({
      revision: 2,
      spreads: expect.arrayContaining([
        expect.objectContaining({
          text: expect.stringContaining("bounded quality revision"),
        }),
      ]),
    });
    await expect(
      repository.readArtifact(
        projectId,
        "story-evaluation-01.json",
        storyEvaluationSchema,
      ),
    ).resolves.toMatchObject({
      outcome: "revision_required",
      storyRevision: 1,
    });
    await expect(
      repository.readArtifact(
        projectId,
        "story-evaluation-02.json",
        storyEvaluationSchema,
      ),
    ).resolves.toMatchObject({ outcome: "pass", storyRevision: 2 });
  });

  it("stops after one automatic revision when story quality still fails", async () => {
    const { repository } = await setup();
    const fixture = new FixtureTextProvider(now);
    let storyGenerations = 0;
    let evaluations = 0;
    const alwaysNeedsRevision: TextProvider = {
      generateDirections: (...arguments_) =>
        fixture.generateDirections(...arguments_),
      generateStory: async (...arguments_) => {
        storyGenerations += 1;
        return fixture.generateStory(...arguments_);
      },
      evaluateStory: async (brief, story) => {
        evaluations += 1;
        const passing = await fixture.evaluateStory(brief, story);
        return storyEvaluationSchema.parse({
          ...passing,
          outcome: "revision_required",
          dimensions: {
            ...passing.dimensions,
            causalStructure: {
              outcome: "revision_required",
              evidence: ["The ending still bypasses the protagonist's choice."],
              revisionInstruction:
                "Make the protagonist's choice cause the ending.",
            },
          },
          revisionInstructions: [
            "Make the protagonist's choice cause the ending.",
          ],
        });
      },
    };
    const service = new StoryWorkflowService(
      repository,
      alwaysNeedsRevision,
      now,
    );
    const brief = projectBriefSchema.parse({
      schemaVersion: 1,
      projectId,
      template: "start_from_scratch",
      originalIdea: "A moon kite flies away.",
      createdAt: now().toISOString(),
    });
    const directions = await service.createDirections(brief);

    await expect(
      service.selectDirection(projectId, directions.directions[0].title),
    ).rejects.toThrow("bounded automatic revision");

    expect(storyGenerations).toBe(2);
    expect(evaluations).toBe(2);
    await expect(
      repository.readArtifact(projectId, "story.json", storyPackageSchema),
    ).resolves.toMatchObject({ revision: 2 });
    await expect(
      repository.readArtifact(projectId, "story-03.json", storyPackageSchema),
    ).rejects.toThrow();
    await expect(
      repository.readArtifact(
        projectId,
        "text-generation-job.json",
        textGenerationJobSchema,
      ),
    ).resolves.toMatchObject({
      status: "failed",
      lastSavedArtifact: "story.json",
    });
  });

  it("resumes evaluation of a saved story without regenerating it", async () => {
    const { repository } = await setup();
    const fixture = new FixtureTextProvider(now);
    let storyGenerations = 0;
    let failEvaluation = true;
    const provider: TextProvider = {
      generateDirections: (...arguments_) =>
        fixture.generateDirections(...arguments_),
      generateStory: async (...arguments_) => {
        storyGenerations += 1;
        return fixture.generateStory(...arguments_);
      },
      evaluateStory: async (...arguments_) => {
        if (failEvaluation) throw new Error("evaluation format failed");
        return fixture.evaluateStory(...arguments_);
      },
    };
    const service = new StoryWorkflowService(repository, provider, now);
    const brief = projectBriefSchema.parse({
      schemaVersion: 1,
      projectId,
      template: "start_from_scratch",
      originalIdea: "A moon kite flies away.",
      createdAt: now().toISOString(),
    });
    const directions = await service.createDirections(brief);
    const directionTitle = directions.directions[0].title;

    await expect(
      service.selectDirection(projectId, directionTitle),
    ).rejects.toThrow("evaluation format failed");
    await expect(
      repository.readArtifact(
        projectId,
        "text-generation-job.json",
        textGenerationJobSchema,
      ),
    ).resolves.toMatchObject({
      status: "failed",
      lastSavedArtifact: "story.json",
      failureMessage: expect.stringContaining(
        "story was generated and saved, but its AI quality review failed",
      ),
    });
    failEvaluation = false;

    await expect(
      service.selectDirection(projectId, directionTitle),
    ).resolves.toMatchObject({ revision: 1 });
    expect(storyGenerations).toBe(1);
    await expect(
      repository.readArtifact(
        projectId,
        "text-generation-job.json",
        textGenerationJobSchema,
      ),
    ).resolves.toMatchObject({
      status: "completed",
      stage: "Reviewing the saved story quality",
      lastSavedArtifact: "story.json",
    });
  });
});
