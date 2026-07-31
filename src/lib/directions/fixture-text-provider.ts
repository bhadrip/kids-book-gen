import type { TextProvider } from "@/lib/directions/text-provider";
import {
  storyDirectionsSchema,
  storyPackageSchema,
  storyQualityEvaluationSchema,
  type ProjectBrief,
  type StoryDirection,
  type StoryDirections,
  type StoryPackage,
  type StoryQualityEvaluation,
} from "@/lib/projects/project";
import {
  visualPlanDraftSchema,
  type VisualPlanDraft,
} from "@/lib/visuals/visual-narrative-artifacts";

export class FixtureTextProvider implements TextProvider {
  public constructor(
    private readonly now: () => Date,
    private readonly delayMs = 0,
  ) {}

  public async generateDirections(
    brief: ProjectBrief,
    options: { revision: number; parentSteering?: string },
  ): Promise<StoryDirections> {
    await this.waitForFixtureDelay();
    if (brief.originalIdea === "Fixture provider failure") {
      throw new Error("Deterministic fixture provider failure.");
    }
    const suffix = options.parentSteering ? ` — ${options.parentSteering}` : "";
    return storyDirectionsSchema.parse({
      schemaVersion: 1,
      projectId: brief.projectId,
      sourceBriefCreatedAt: brief.createdAt,
      generatedAt: this.now().toISOString(),
      model: "fixture-text-provider",
      revision: options.revision,
      parentSteering: options.parentSteering,
      directions: [
        {
          title: `The Moon Kite Mission${suffix}`,
          storyEngine: "Mission with obstacles",
          promise: "Milo must return a runaway moon kite before sunrise.",
          opening: "A silver string slips through Milo's fingers.",
          ending: "The kite becomes a new star above home.",
        },
        {
          title: `The Kite That Kept Trying${suffix}`,
          storyEngine: "Try, fail, change the plan",
          promise: "A stubborn kite learns three surprising ways to fly.",
          opening: "The kite bumps along the grass.",
          ending: "Its smallest idea carries it highest.",
        },
        {
          title: `Why the Moon Hid${suffix}`,
          storyEngine: "A feeling changes shape",
          promise: "Milo helps the moon name why it has gone dim.",
          opening: "The moon is missing from Milo's window.",
          ending: "The moon returns with a gentler glow.",
        },
      ],
    });
  }

  public async generateStory(
    brief: ProjectBrief,
    direction: StoryDirection,
    options: {
      revision: number;
      parentSteering?: string;
      qualityFeedback?: string;
    },
  ): Promise<StoryPackage> {
    await this.waitForFixtureDelay();
    return storyPackageSchema.parse({
      schemaVersion: 1,
      projectId: brief.projectId,
      generatedAt: this.now().toISOString(),
      model: "fixture-text-provider",
      revision: options.revision,
      sourceDirectionTitle: direction.title,
      parentSteering: options.parentSteering,
      title: direction.title,
      characters: [
        {
          name: brief.protagonist ?? "Milo",
          role: "protagonist",
          description: "A curious child who keeps trying.",
        },
      ],
      promise: direction.promise,
      arc: {
        beginning: direction.opening,
        middle: options.qualityFeedback
          ? "Three clear, escalating choices reveal what matters most."
          : "Three escalating choices reveal what matters most.",
        ending: direction.ending,
      },
      spreads: Array.from({ length: 13 }, (_, index) => ({
        number: index + 1,
        beat: `Story beat ${index + 1}`,
        text: `Spread ${index + 1} moves the adventure forward while preserving the family's idea.`,
      })),
    });
  }

  public async evaluateStory(
    brief: ProjectBrief,
    _direction: StoryDirection,
    story: StoryPackage,
  ): Promise<StoryQualityEvaluation> {
    await this.waitForFixtureDelay();
    const needsRevision =
      brief.originalIdea === "Fixture story needs one quality revision" &&
      !story.arc.middle.includes("clear");
    return storyQualityEvaluationSchema.parse({
      schemaVersion: 1,
      projectId: brief.projectId,
      storyRevision: story.revision,
      evaluatedAt: this.now().toISOString(),
      model: "fixture-text-provider",
      verdict: needsRevision ? "revise" : "pass",
      checks: {
        fidelity: "pass",
        structure: needsRevision ? "revise" : "pass",
        ageFit: "pass",
        oralFlow: "pass",
        safety: "pass",
      },
      revisionBrief: needsRevision
        ? "Make the middle escalation clearer while preserving the story."
        : undefined,
    });
  }

  public async generateVisualPlan(
    brief: ProjectBrief,
    story: StoryPackage,
  ): Promise<VisualPlanDraft & { model: string }> {
    await this.waitForFixtureDelay();
    if (brief.originalIdea === "Fixture visual plan failure")
      throw new Error("Deterministic fixture visual-plan failure.");
    const character = story.characters[0];
    return {
      ...visualPlanDraftSchema.parse({
        emotionalArc: {
          characters: [
            {
              characterName: character?.name ?? "Main character",
              beats: story.spreads.map((spread, index) => ({
                spreadNumber: spread.number,
                enteringState: index === 0 ? "curious" : "engaged",
                trigger: spread.beat,
                outwardExpression: `A clear, child-readable response to ${spread.beat.toLowerCase()}.`,
                leavingState:
                  index === story.spreads.length - 1 ? "satisfied" : "ready",
                intensity:
                  index > 8
                    ? ("high" as const)
                    : index > 3
                      ? ("medium" as const)
                      : ("low" as const),
                avoidSignals: brief.avoid ? [brief.avoid] : [],
              })),
            },
          ],
        },
        spreadMap: {
          spreads: story.spreads.map((spread) => ({
            spreadNumber: spread.number,
            storyBeat: spread.beat,
            storyJob: `Move the approved story through ${spread.beat.toLowerCase()}.`,
            mainAction: `Show the main character acting on ${spread.beat.toLowerCase()}.`,
            emotionalMovement: `Attention shifts as ${spread.beat.toLowerCase()} unfolds.`,
            illustrationIntent: `Make ${spread.beat.toLowerCase()} visually clear without repeating the manuscript.`,
            mustShow: brief.mustKeep ? [brief.mustKeep] : [],
            mustAvoid: brief.avoid ? [brief.avoid] : [],
            pageTurnQuestion:
              spread.number === 13
                ? "How will this feeling stay with the family?"
                : "What will happen next?",
          })),
        },
      }),
      model: "fixture-text-provider",
    };
  }

  private async waitForFixtureDelay(): Promise<void> {
    if (this.delayMs === 0) return;
    await new Promise((resolve) => setTimeout(resolve, this.delayMs));
  }
}
