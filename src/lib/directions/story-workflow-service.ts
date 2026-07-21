import type { TextProvider } from "@/lib/directions/text-provider";
import type { FileProjectRepository } from "@/lib/projects/file-project-repository";
import { ZodError } from "zod";
import {
  projectBriefSchema,
  selectedDirectionSchema,
  storyDecisionSchema,
  storyDirectionsSchema,
  storyEvaluationSchema,
  storyPackageSchema,
  textGenerationJobSchema,
  type ProjectBrief,
  type StoryDecision,
  type StoryDirections,
  type StoryEvaluation,
  type StoryPackage,
  type TextGenerationJob,
} from "@/lib/projects/project";

export class StoryQualityError extends Error {
  public constructor() {
    super(
      "Story quality needs review after the bounded automatic revision. The latest story remains saved.",
    );
    this.name = "StoryQualityError";
  }
}

export class StoryEvaluationError extends Error {
  public constructor(public override readonly cause: unknown) {
    super(
      cause instanceof Error
        ? cause.message
        : "The AI story evaluation could not be completed.",
    );
    this.name = "StoryEvaluationError";
  }
}

export function describeGenerationFailure(error: unknown): string {
  if (error instanceof StoryQualityError) return error.message;
  if (error instanceof StoryEvaluationError)
    return `The story was generated and saved, but its AI quality review failed. ${describeGenerationFailure(error.cause)}`;
  if (error instanceof ZodError)
    return "The AI returned a response that did not match the required story format. Your last saved work is safe; retry this step.";
  if (error instanceof Error && error.message.includes("OPENAI_API_KEY"))
    return "OpenAI is not configured. Add a valid OPENAI_API_KEY to .env.local, restart the app, and retry.";

  const status =
    typeof error === "object" && error !== null && "status" in error
      ? Number(error.status)
      : undefined;
  if (status === 401)
    return "OpenAI rejected the API key. Check OPENAI_API_KEY in .env.local, restart the app, and retry.";
  if (status === 403)
    return "This OpenAI account does not have access to the requested model. Check the configured model or account permissions, then retry.";
  if (status === 404)
    return "The configured OpenAI model was not found. Check KIDS_BOOK_TEXT_MODEL in .env.local, restart the app, and retry.";
  if (status === 429)
    return "OpenAI rejected the request because of a usage limit, rate limit, or billing balance. Check API usage and billing, then retry.";
  if (status !== undefined && status >= 500)
    return "OpenAI is temporarily unavailable. Your last saved work is safe; wait briefly and retry this step.";
  return "The AI provider could not complete this step. Your last saved work is safe; retry the step. If it fails again, check the development-server log for the provider error.";
}

export class StoryWorkflowService {
  public constructor(
    private readonly repository: FileProjectRepository,
    private readonly provider: TextProvider,
    private readonly now: () => Date,
  ) {}

  public async createDirections(brief: ProjectBrief): Promise<StoryDirections> {
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
    const savedStory = await this.repository
      .readArtifact(projectId, "story.json", storyPackageSchema)
      .catch(() => null);
    const savedEvaluation = await this.repository
      .readArtifact(projectId, "story-evaluation.json", storyEvaluationSchema)
      .catch(() => null);
    if (
      savedStory?.sourceDirectionTitle === direction.title &&
      savedEvaluation?.storyRevision !== savedStory.revision
    )
      return this.runGenerationJob(
        projectId,
        `story-${String(savedStory.revision).padStart(2, "0")}`,
        "story",
        "Reviewing the saved story quality",
        "story.json",
        () => this.evaluateAndMaybeRevise(brief, direction, savedStory),
      );
    return this.runGenerationJob(
      projectId,
      "story-01",
      "story",
      "Creating a 13-spread story draft",
      "selected-direction.json",
      async () => {
        const story = await this.provider.generateStory(brief, direction, {
          revision: 1,
          parentSteering: parentFeedback,
        });
        await this.saveStory(projectId, story);
        return this.evaluateAndMaybeRevise(brief, direction, story);
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
        const generated = await this.provider.generateStory(brief, direction, {
          revision,
          parentSteering: feedback,
          sourceStory: story,
        });
        await this.saveStory(projectId, generated);
        return this.evaluateAndMaybeRevise(brief, direction, generated);
      },
    );
    return { decision, story: revised };
  }

  private async generateAndSaveDirections(
    brief: ProjectBrief,
    revision: number,
    parentSteering?: string,
  ) {
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

  private async evaluateAndMaybeRevise(
    brief: ProjectBrief,
    direction: StoryDirections["directions"][number],
    story: StoryPackage,
  ): Promise<StoryPackage> {
    const evaluation = await this.evaluateAndSaveStory(brief, story);
    if (evaluation.outcome === "pass") return story;
    if (evaluation.outcome === "escalation_required")
      throw new StoryQualityError();

    const revisedStory = await this.provider.generateStory(brief, direction, {
      revision: story.revision + 1,
      parentSteering: story.parentSteering,
      sourceStory: story,
      qualityRevision: {
        instructions: evaluation.revisionInstructions,
        preserve: evaluation.preserve,
      },
    });
    await this.saveStory(brief.projectId, revisedStory);
    const revisedEvaluation = await this.evaluateAndSaveStory(
      brief,
      revisedStory,
    );
    if (revisedEvaluation.outcome !== "pass") throw new StoryQualityError();
    return revisedStory;
  }

  private async evaluateAndSaveStory(
    brief: ProjectBrief,
    story: StoryPackage,
  ): Promise<StoryEvaluation> {
    let evaluation: StoryEvaluation;
    try {
      evaluation = storyEvaluationSchema.parse(
        await this.provider.evaluateStory(brief, story),
      );
    } catch (error) {
      throw new StoryEvaluationError(error);
    }
    await this.repository.writeArtifact(
      brief.projectId,
      `story-evaluation-${String(story.revision).padStart(2, "0")}.json`,
      evaluation,
    );
    await this.repository.writeArtifact(
      brief.projectId,
      "story-evaluation.json",
      evaluation,
    );
    return evaluation;
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
      const safeArtifact =
        error instanceof StoryQualityError ||
        error instanceof StoryEvaluationError
          ? "story.json"
          : lastSavedArtifact;
      await this.saveGenerationJob(projectId, {
        ...job,
        status: "failed",
        updatedAt: this.now().toISOString(),
        lastSavedArtifact: safeArtifact,
        failureMessage: describeGenerationFailure(error),
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
