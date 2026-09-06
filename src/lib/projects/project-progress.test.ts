import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { FixtureTextProvider } from "@/lib/directions/fixture-text-provider";
import { StoryWorkflowService } from "@/lib/directions/story-workflow-service";
import { FileProjectRepository } from "@/lib/projects/file-project-repository";
import { getProjectProgress } from "@/lib/projects/project-progress";
import {
  projectBriefSchema,
  selectedDirectionSchema,
  storyDecisionSchema,
  storyDirectionsSchema,
  storyPackageSchema,
  textGenerationJobSchema,
} from "@/lib/projects/project";
import { VisualNarrativeWorkflowService } from "@/lib/visuals/visual-narrative-workflow-service";

const directories: string[] = [];
const projectId = "4a2b8437-2e5d-492d-885b-4f1052d4da88";
const timestamp = "2026-07-20T12:00:00.000Z";

afterEach(async () => {
  await Promise.all(
    directories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true })),
  );
});

async function setup() {
  const directory = await mkdtemp(join(tmpdir(), "kids-book-progress-"));
  directories.push(directory);
  const repository = new FileProjectRepository(directory, {
    now: () => new Date(timestamp),
    createId: () => projectId,
  });
  await repository.create({ title: "Moon Kite" });
  return repository;
}

describe("getProjectProgress", () => {
  it("offers the idea as the first exact action for an empty project", async () => {
    const repository = await setup();

    await expect(getProjectProgress(repository, projectId)).resolves.toEqual({
      idea: "Not started",
      directions: "Not started",
      story: "Not started",
      look: "Not started",
      book: "Not started",
      nextAction: {
        href: `/projects/${projectId}/idea`,
        label: "Shape the story idea",
        reason: "Tell us the family idea and the details the story must keep.",
      },
    });
  });

  it("marks a saved brief and selection as needing a safe generation retry", async () => {
    const repository = await setup();
    await repository.writeArtifact(
      projectId,
      "brief.json",
      projectBriefSchema.parse({
        schemaVersion: 1,
        projectId,
        template: "start_from_scratch",
        originalIdea: "A moon kite flies away.",
        readerConfiguration: { age: 8, readingMode: "parent_read_aloud" },
        createdAt: timestamp,
      }),
    );

    const briefOnly = await getProjectProgress(repository, projectId);
    expect(briefOnly).toMatchObject({
      idea: "Needs attention",
      nextAction: { label: "Retry story directions" },
    });

    await repository.writeArtifact(
      projectId,
      "directions.json",
      storyDirectionsSchema.parse({
        schemaVersion: 1,
        projectId,
        sourceBriefCreatedAt: timestamp,
        generatedAt: timestamp,
        model: "fixture",
        revision: 1,
        directions: [
          {
            title: "One",
            storyEngine: "Mission",
            promise: "Promise one",
            opening: "Opening one",
            ending: "Ending one",
          },
          {
            title: "Two",
            storyEngine: "Mystery",
            promise: "Promise two",
            opening: "Opening two",
            ending: "Ending two",
          },
          {
            title: "Three",
            storyEngine: "Change",
            promise: "Promise three",
            opening: "Opening three",
            ending: "Ending three",
          },
        ],
      }),
    );
    await repository.writeArtifact(
      projectId,
      "selected-direction.json",
      selectedDirectionSchema.parse({
        schemaVersion: 1,
        projectId,
        directionTitle: "One",
        directionsRevision: 1,
        selectedAt: timestamp,
      }),
    );

    const selectedOnly = await getProjectProgress(repository, projectId);
    expect(selectedOnly).toMatchObject({
      idea: "Approved",
      directions: "Approved",
      story: "Needs attention",
      nextAction: { label: "Retry story draft" },
    });
  });

  it("only marks the current story revision approved", async () => {
    const repository = await setup();
    const story = storyPackageSchema.parse({
      schemaVersion: 1,
      projectId,
      generatedAt: timestamp,
      model: "fixture",
      revision: 2,
      sourceDirectionTitle: "One",
      title: "One",
      characters: [
        { name: "Milo", role: "hero", description: "A curious child." },
      ],
      promise: "A promise",
      arc: { beginning: "Begin", middle: "Middle", ending: "End" },
      spreads: Array.from({ length: 13 }, (_, index) => ({
        number: index + 1,
        beat: `Beat ${index + 1}`,
        text: `Text ${index + 1}`,
      })),
    });
    await repository.writeArtifact(projectId, "story.json", story);
    await repository.writeArtifact(
      projectId,
      "story-decision.json",
      storyDecisionSchema.parse({
        schemaVersion: 1,
        projectId,
        storyRevision: 1,
        status: "approved",
        decidedAt: timestamp,
      }),
    );

    expect((await getProjectProgress(repository, projectId)).story).toBe(
      "Ready for your review",
    );
  });

  it("restores an active generation stage from its persisted job", async () => {
    const repository = await setup();
    await repository.writeArtifact(
      projectId,
      "text-generation-job.json",
      textGenerationJobSchema.parse({
        schemaVersion: 1,
        projectId,
        jobKey: "directions-01",
        kind: "directions",
        status: "in_progress",
        stage: "Creating three story directions",
        lastSavedArtifact: "brief.json",
        startedAt: timestamp,
        updatedAt: timestamp,
      }),
    );

    await expect(
      getProjectProgress(repository, projectId),
    ).resolves.toMatchObject({
      idea: "In progress",
      nextAction: {
        label: "Check generation status",
        reason: expect.stringContaining("brief.json is safely saved"),
      },
    });
  });

  it("moves from visual-plan creation to review and exact approval", async () => {
    const repository = await setup();
    const now = () => new Date(timestamp);
    const provider = new FixtureTextProvider(now);
    const storyService = new StoryWorkflowService(repository, provider, now);
    const brief = projectBriefSchema.parse({
      schemaVersion: 1,
      projectId,
      template: "start_from_scratch",
      originalIdea: "A moon kite flies away.",
      readerConfiguration: { age: 8, readingMode: "parent_read_aloud" },
      createdAt: timestamp,
    });
    const directions = await storyService.createDirections(brief);
    await storyService.selectDirection(
      projectId,
      directions.directions[0].title,
    );
    await storyService.decideStory(projectId, "approved");

    await expect(
      getProjectProgress(repository, projectId),
    ).resolves.toMatchObject({
      look: "Not started",
      nextAction: { label: "Create the visual story plan" },
    });

    const visualNarrative = new VisualNarrativeWorkflowService(
      repository,
      provider,
      now,
    );
    await visualNarrative.generatePlan(projectId);
    await expect(
      getProjectProgress(repository, projectId),
    ).resolves.toMatchObject({
      look: "Ready for your review",
      nextAction: { label: "Review the visual story plan" },
    });

    await visualNarrative.decidePlan(projectId, "approved");
    await expect(
      getProjectProgress(repository, projectId),
    ).resolves.toMatchObject({
      look: "Needs attention",
      nextAction: { label: "Choose an art direction" },
    });
  });
});
