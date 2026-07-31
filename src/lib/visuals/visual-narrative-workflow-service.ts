import type { TextProvider } from "@/lib/directions/text-provider";
import type { FileProjectRepository } from "@/lib/projects/file-project-repository";
import {
  projectBriefSchema,
  storyDecisionSchema,
  storyPackageSchema,
  type ProjectBrief,
  type StoryPackage,
} from "@/lib/projects/project";
import {
  emotionalArcSchema,
  spreadMapSchema,
  visualPlanDecisionSchema,
  visualPlanJobSchema,
  type EmotionalArc,
  type SpreadMap,
  type VisualPlanDecision,
  type VisualPlanJob,
} from "@/lib/visuals/visual-narrative-artifacts";

async function readOptional<T>(operation: Promise<T>): Promise<T | null> {
  return operation.catch(() => null);
}

export class VisualNarrativeWorkflowService {
  public constructor(
    private readonly repository: FileProjectRepository,
    private readonly provider: TextProvider,
    private readonly now: () => Date,
  ) {}

  public async generatePlan(
    projectId: string,
    parentSteering?: string,
  ): Promise<{ emotionalArc: EmotionalArc; spreadMap: SpreadMap }> {
    const { brief, story } = await this.loadApprovedStory(projectId);
    const current = await readOptional(
      this.repository.readArtifact(
        projectId,
        "spread-map.json",
        spreadMapSchema,
      ),
    );
    const revision = (current?.revision ?? 0) + 1;
    const jobKey = `visual-plan-${String(revision).padStart(2, "0")}`;
    const startedAt = this.now().toISOString();
    const job = visualPlanJobSchema.parse({
      schemaVersion: 1,
      projectId,
      jobKey,
      status: "in_progress",
      stage: parentSteering
        ? "Revising the visual story plan"
        : "Planning the story for pictures",
      lastSavedArtifact: "story-decision.json",
      startedAt,
      updatedAt: startedAt,
    });
    await this.saveJob(projectId, job);

    try {
      const draft = await this.provider.generateVisualPlan(brief, story, {
        revision,
        parentSteering,
      });
      const generatedAt = this.now().toISOString();
      const emotionalArc = emotionalArcSchema.parse({
        ...draft.emotionalArc,
        schemaVersion: 1,
        projectId,
        revision,
        sourceStoryRevision: story.revision,
        generatedAt,
        model: draft.model,
      });
      await this.repository.writeArtifact(
        projectId,
        `emotional-arc-${String(revision).padStart(2, "0")}.json`,
        emotionalArc,
      );

      const spreadMap = spreadMapSchema.parse({
        ...draft.spreadMap,
        schemaVersion: 1,
        projectId,
        revision,
        sourceStoryRevision: story.revision,
        sourceEmotionalArcRevision: emotionalArc.revision,
        generatedAt,
        model: emotionalArc.model,
        parentSteering,
      });
      await this.repository.writeArtifact(
        projectId,
        `spread-map-${String(revision).padStart(2, "0")}.json`,
        spreadMap,
      );
      await this.repository.writeArtifact(
        projectId,
        "emotional-arc.json",
        emotionalArc,
      );
      await this.repository.writeArtifact(
        projectId,
        "spread-map.json",
        spreadMap,
      );
      await this.saveJob(projectId, {
        ...job,
        status: "completed",
        stage: "Visual story plan ready for review",
        lastSavedArtifact: "spread-map.json",
        updatedAt: this.now().toISOString(),
        completedAt: this.now().toISOString(),
      });
      return { emotionalArc, spreadMap };
    } catch (error) {
      const emotionalArc = await readOptional(
        this.repository.readArtifact(
          projectId,
          `emotional-arc-${String(revision).padStart(2, "0")}.json`,
          emotionalArcSchema,
        ),
      );
      await this.saveJob(projectId, {
        ...job,
        status: "failed",
        stage: "Visual story planning needs attention",
        lastSavedArtifact:
          emotionalArc?.revision === revision
            ? `emotional-arc-${String(revision).padStart(2, "0")}.json`
            : "story-decision.json",
        updatedAt: this.now().toISOString(),
        completedAt: this.now().toISOString(),
        failureMessage:
          error instanceof Error ? error.message : "Visual planning failed.",
      });
      throw error;
    }
  }

  public async decidePlan(
    projectId: string,
    status: "approved" | "change_requested",
    feedback?: string,
  ): Promise<{ decision: VisualPlanDecision; spreadMap: SpreadMap }> {
    const spreadMap = await this.repository.readArtifact(
      projectId,
      "spread-map.json",
      spreadMapSchema,
    );
    if (status === "change_requested" && !feedback?.trim())
      throw new Error("Tell us what should feel or happen differently.");
    const decision = visualPlanDecisionSchema.parse({
      schemaVersion: 1,
      projectId,
      spreadMapRevision: spreadMap.revision,
      status,
      feedback,
      decidedAt: this.now().toISOString(),
    });
    await this.repository.writeArtifact(
      projectId,
      `visual-plan-decision-${String(spreadMap.revision).padStart(2, "0")}.json`,
      decision,
    );
    await this.repository.writeArtifact(
      projectId,
      "visual-plan-decision.json",
      decision,
    );
    if (status === "approved") return { decision, spreadMap };
    const revised = await this.generatePlan(projectId, feedback);
    return { decision, spreadMap: revised.spreadMap };
  }

  private async loadApprovedStory(projectId: string): Promise<{
    brief: ProjectBrief;
    story: StoryPackage;
  }> {
    const [brief, story, decision] = await Promise.all([
      this.repository.readArtifact(projectId, "brief.json", projectBriefSchema),
      this.repository.readArtifact(projectId, "story.json", storyPackageSchema),
      this.repository.readArtifact(
        projectId,
        "story-decision.json",
        storyDecisionSchema,
      ),
    ]);
    if (
      decision.status !== "approved" ||
      decision.storyRevision !== story.revision
    )
      throw new Error(
        "Approve the current story before planning the pictures.",
      );
    return { brief, story };
  }

  private async saveJob(projectId: string, job: VisualPlanJob): Promise<void> {
    const parsed = visualPlanJobSchema.parse(job);
    await this.repository.writeArtifact(
      projectId,
      `${parsed.jobKey}-job.json`,
      parsed,
    );
    await this.repository.writeArtifact(
      projectId,
      "visual-plan-job.json",
      parsed,
    );
  }
}
