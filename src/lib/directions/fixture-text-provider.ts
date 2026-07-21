import type {
  StoryGenerationOptions,
  TextProvider,
} from "@/lib/directions/text-provider";
import {
  storyDirectionsSchema,
  storyEvaluationSchema,
  storyPackageSchema,
  type ProjectBrief,
  type StoryDirection,
  type StoryDirections,
  type StoryEvaluation,
  type StoryPackage,
} from "@/lib/projects/project";

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
    options: StoryGenerationOptions,
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
        middle: "Three escalating choices reveal what matters most.",
        ending: direction.ending,
      },
      spreads: Array.from({ length: 13 }, (_, index) => ({
        number: index + 1,
        beat: `Story beat ${index + 1}`,
        text: `Spread ${index + 1} moves the adventure forward while preserving the family's idea${options.qualityRevision ? " after a bounded quality revision" : ""}.`,
      })),
    });
  }

  public async evaluateStory(
    brief: ProjectBrief,
    story: StoryPackage,
  ): Promise<StoryEvaluation> {
    await this.waitForFixtureDelay();
    if (brief.originalIdea === "Fixture story evaluation failure")
      throw new Error("Deterministic fixture evaluation failure.");
    const needsRevision =
      brief.originalIdea === "Fixture story quality revision" &&
      story.revision === 1;
    const passingDimension = (evidence: string) => ({
      outcome: "pass" as const,
      evidence: [evidence],
    });
    return storyEvaluationSchema.parse({
      schemaVersion: 1,
      projectId: brief.projectId,
      storyRevision: story.revision,
      evaluatedAt: this.now().toISOString(),
      model: "fixture-text-provider",
      outcome: needsRevision ? "revision_required" : "pass",
      dimensions: {
        ideaFidelity: passingDimension(
          "The fixture preserves the family idea.",
        ),
        causalStructure: needsRevision
          ? {
              outcome: "revision_required",
              evidence: ["The fixture requests one deterministic repair."],
              revisionInstruction:
                "Make the protagonist's final choice cause the resolution.",
            }
          : passingDimension("The protagonist's choices move the story."),
        ageFit: passingDimension("The language fits ages 7–10."),
        oralFlow: passingDimension("The spreads are concise for read-aloud."),
        safety: passingDimension("No safety concern is present."),
      },
      preserve: ["The family idea and must-keep details"],
      revisionInstructions: needsRevision
        ? ["Make the protagonist's final choice cause the resolution."]
        : [],
    });
  }

  private async waitForFixtureDelay(): Promise<void> {
    if (this.delayMs === 0) return;
    await new Promise((resolve) => setTimeout(resolve, this.delayMs));
  }
}
