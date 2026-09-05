import type { TextProvider } from "@/lib/directions/text-provider";
import type { FileProjectRepository } from "@/lib/projects/file-project-repository";
import {
  projectBriefSchema,
  selectedDirectionSchema,
  storyDecisionSchema,
  storyDirectionsSchema,
  storyPackageSchema,
  storyQualityEvaluationSchema,
  textGenerationJobSchema,
  type ProjectBrief,
  type StoryDecision,
  type StoryDirections,
  type StoryPackage,
  type TextGenerationJob,
} from "@/lib/projects/project";

export class StoryWorkflowService {
  public constructor(
    private readonly repository: FileProjectRepository,
    private readonly provider: TextProvider,
    private readonly now: () => Date,
  ) {}

  public async createDirections(brief: ProjectBrief): Promise<StoryDirections> {
    if (!brief.readerConfiguration)
      throw new Error(
        "Confirm reader age and reading mode before generating directions.",
      );
    await this.repository.writeArtifact(brief.projectId, "brief.json", brief);
    return this.runGenerationJob(
      brief.projectId,
      "directions-01",
      "directions",
      "Creating three story directions",
      "brief.json",
      () => this.generateAndSaveDirections(brief, 1),
    );
  }

  public async reviseDirections(
    projectId: string,
    parentSteering: string,
  ): Promise<StoryDirections> {
    const brief = await this.repository.readArtifact(
      projectId,
      "brief.json",
      projectBriefSchema,
    );
    const current = await this.repository.readArtifact(
      projectId,
      "directions.json",
      storyDirectionsSchema,
    );
    const revision = current.revision + 1;
    return this.runGenerationJob(
      projectId,
      `directions-${String(revision).padStart(2, "0")}`,
      "directions_revision",
      "Revising three story directions",
      "directions.json",
      () => this.generateAndSaveDirections(brief, revision, parentSteering),
    );
  }

  public async selectDirection(
    projectId: string,
    directionTitle: string,
    parentFeedback?: string,
  ): Promise<StoryPackage> {
    const brief = await this.repository.readArtifact(
      projectId,
      "brief.json",
      projectBriefSchema,
    );
    const directions = await this.repository.readArtifact(
      projectId,
      "directions.json",
      storyDirectionsSchema,
    );
    const direction = directions.directions.find(
      (item) => item.title === directionTitle,
    );
    if (!direction)
      throw new Error("Choose one of this project's generated directions.");
    const selected = selectedDirectionSchema.parse({
      schemaVersion: 1,
      projectId,
      directionTitle,
      directionsRevision: directions.revision,
      parentFeedback,
      selectedAt: this.now().toISOString(),
    });
    await this.repository.writeArtifact(
      projectId,
      "selected-direction.json",
      selected,
    );
    return this.runGenerationJob(
      projectId,
      "story-01",
      "story",
      "Creating a 13-spread story draft",
      "selected-direction.json",
      async () => {
        const story = await this.generateQualityCheckedStory(brief, direction, {
          revision: 1,
          parentSteering: parentFeedback,
        });
        await this.saveStory(projectId, story);
        return story;
      },
    );
  }

  public async decideStory(
    projectId: string,
    status: "approved" | "revision_requested",
    feedback?: string,
  ): Promise<{ decision: StoryDecision; story: StoryPackage }> {
    const story = await this.repository.readArtifact(
      projectId,
      "story.json",
      storyPackageSchema,
    );
    const decision = storyDecisionSchema.parse({
      schemaVersion: 1,
      projectId,
      storyRevision: story.revision,
      status,
      feedback,
      decidedAt: this.now().toISOString(),
    });
    await this.repository.writeArtifact(
      projectId,
      `story-decision-${String(story.revision).padStart(2, "0")}.json`,
      decision,
    );
    await this.repository.writeArtifact(
      projectId,
      "story-decision.json",
      decision,
    );
    if (status === "approved") return { decision, story };
    if (!feedback)
      throw new Error("Tell us what to change before revising the story.");
    const brief = await this.repository.readArtifact(
      projectId,
      "brief.json",
      projectBriefSchema,
    );
    const directions = await this.repository.readArtifact(
      projectId,
      "directions.json",
      storyDirectionsSchema,
    );
    const direction = directions.directions.find(
      (item) => item.title === story.sourceDirectionTitle,
    );
    if (!direction)
      throw new Error("The selected direction is no longer available.");
    const revision = story.revision + 1;
    const revised = await this.runGenerationJob(
      projectId,
      `story-${String(revision).padStart(2, "0")}`,
      "story_revision",
      "Revising the 13-spread story draft",
      "story.json",
      async () => {
        const generated = await this.generateQualityCheckedStory(
          brief,
          direction,
          {
            revision,
            parentSteering: feedback,
          },
        );
        await this.saveStory(projectId, generated);
        return generated;
      },
    );
    return { decision, story: revised };
  }

  private async generateAndSaveDirections(
    brief: ProjectBrief,
    revision: number,
    parentSteering?: string,
  ) {
    if (!brief.readerConfiguration)
      throw new Error(
        "Confirm reader age and reading mode before generating directions.",
      );
    const directions = await this.provider.generateDirections(brief, {
      revision,
      parentSteering,
    });
    await this.repository.writeArtifact(
      brief.projectId,
      `directions-${String(revision).padStart(2, "0")}.json`,
      directions,
    );
    await this.repository.writeArtifact(
      brief.projectId,
      "directions.json",
      directions,
    );
    return directions;
  }

  private async saveStory(projectId: string, story: StoryPackage) {
    await this.repository.writeArtifact(
      projectId,
      `story-${String(story.revision).padStart(2, "0")}.json`,
      story,
    );
    await this.repository.writeArtifact(projectId, "story.json", story);
  }

  private async generateQualityCheckedStory(
    brief: ProjectBrief,
    direction: StoryDirections["directions"][number],
    options: { revision: number; parentSteering?: string },
  ): Promise<StoryPackage> {
    const firstDraft = await this.provider.generateStory(
      brief,
      direction,
      options,
    );
    await this.repository.writeArtifact(
      brief.projectId,
      `story-quality-input-${String(options.revision).padStart(2, "0")}.json`,
      firstDraft,
    );
    const evaluation = storyQualityEvaluationSchema.parse(
      await this.provider.evaluateStory(brief, direction, firstDraft),
    );
    await this.repository.writeArtifact(
      brief.projectId,
      `story-quality-evaluation-${String(options.revision).padStart(2, "0")}.json`,
      evaluation,
    );
    if (evaluation.verdict === "pass") return firstDraft;
    if (!evaluation.revisionBrief)
      throw new Error("The quality evaluation did not explain its revision.");
    return this.provider.generateStory(brief, direction, {
      ...options,
      qualityFeedback: evaluation.revisionBrief,
    });
  }

  private async runGenerationJob<T>(
    projectId: string,
    jobKey: string,
    kind: TextGenerationJob["kind"],
    stage: string,
    lastSavedArtifact: string,
    operation: () => Promise<T>,
  ): Promise<T> {
    const startedAt = this.now().toISOString();
    const job = textGenerationJobSchema.parse({
      schemaVersion: 1,
      projectId,
      jobKey,
      kind,
      status: "in_progress",
      stage,
      lastSavedArtifact,
      startedAt,
      updatedAt: startedAt,
    });
    await this.saveGenerationJob(projectId, job);

    try {
      const result = await operation();
      const completedAt = this.now().toISOString();
      await this.saveGenerationJob(projectId, {
        ...job,
        status: "completed",
        updatedAt: completedAt,
        completedAt,
      });
      return result;
    } catch (error) {
      const failureMessage =
        error instanceof Error
          ? error.message.slice(0, 500)
          : "Generation did not finish. The last saved artifact is still available.";
      await this.saveGenerationJob(projectId, {
        ...job,
        status: "failed",
        updatedAt: this.now().toISOString(),
        failureMessage,
      });
      throw error;
    }
  }

  private async saveGenerationJob(
    projectId: string,
    job: TextGenerationJob,
  ): Promise<void> {
    const parsed = textGenerationJobSchema.parse(job);
    await this.repository.writeArtifact(
      projectId,
      `${job.jobKey}-job.json`,
      parsed,
    );
    await this.repository.writeArtifact(
      projectId,
      "text-generation-job.json",
      parsed,
    );
  }
}
