import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import type { TextProvider } from "@/lib/directions/text-provider";
import {
  storyDirectionsSchema,
  storyDirectionSchema,
  storyPackageSchema,
  storyQualityEvaluationSchema,
  type ProjectBrief,
  type StoryDirection,
  type StoryPackage,
  type StoryDirections,
  type StoryQualityEvaluation,
} from "@/lib/projects/project";
import {
  visualPlanDraftSchema,
  type VisualPlanDraft,
} from "@/lib/visuals/visual-narrative-artifacts";

const directionResponseSchema = z.object({
  directions: z.array(storyDirectionSchema).length(3),
});

export class OpenAITextProvider implements TextProvider {
  public constructor(
    private readonly apiKey: string,
    private readonly model: string,
    private readonly now: () => Date,
  ) {}

  public async generateDirections(
    brief: ProjectBrief,
    options: { revision: number; parentSteering?: string },
  ): Promise<StoryDirections> {
    const response = await new OpenAI({ apiKey: this.apiKey }).responses.parse({
      model: this.model,
      input: [
        {
          role: "developer",
          content:
            "Create exactly three child-friendly story directions. Each must use a genuinely different story engine, not a cosmetic variation. Preserve every must-keep detail. Return only the requested structured response.",
        },
        {
          role: "user",
          content: JSON.stringify({
            brief,
            parentSteering: options.parentSteering,
          }),
        },
      ],
      text: {
        format: zodTextFormat(directionResponseSchema, "story_directions"),
      },
    });
    if (!response.output_parsed) {
      throw new Error("The text provider did not return story directions.");
    }

    return storyDirectionsSchema.parse({
      ...response.output_parsed,
      schemaVersion: 1,
      projectId: brief.projectId,
      sourceBriefCreatedAt: brief.createdAt,
      generatedAt: this.now().toISOString(),
      model: this.model,
      revision: options.revision,
      parentSteering: options.parentSteering,
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
    const format = storyPackageSchema.pick({
      title: true,
      characters: true,
      promise: true,
      arc: true,
      spreads: true,
    });
    const response = await new OpenAI({ apiKey: this.apiKey }).responses.parse({
      model: this.model,
      input: [
        {
          role: "developer",
          content:
            "Write a safe, warm story package for ages 7–10. Preserve must-keep details. Return exactly 13 concise, non-empty read-aloud spreads.",
        },
        {
          role: "user",
          content: JSON.stringify({
            brief,
            direction,
            parentSteering: options.parentSteering,
            hiddenQualityFeedback: options.qualityFeedback,
          }),
        },
      ],
      text: { format: zodTextFormat(format, "story_package") },
    });
    if (!response.output_parsed) throw new Error("No story package returned.");
    return storyPackageSchema.parse({
      ...response.output_parsed,
      schemaVersion: 1,
      projectId: brief.projectId,
      generatedAt: this.now().toISOString(),
      model: this.model,
      revision: options.revision,
      sourceDirectionTitle: direction.title,
      parentSteering: options.parentSteering,
    });
  }

  public async evaluateStory(
    brief: ProjectBrief,
    direction: StoryDirection,
    story: StoryPackage,
  ): Promise<StoryQualityEvaluation> {
    const format = z.object({
      verdict: z.enum(["pass", "revise"]),
      checks: z.object({
        fidelity: z.enum(["pass", "revise"]),
        structure: z.enum(["pass", "revise"]),
        ageFit: z.enum(["pass", "revise"]),
        oralFlow: z.enum(["pass", "revise"]),
        safety: z.enum(["pass", "revise"]),
      }),
      revisionBrief: z.string().trim().min(1).max(1_500).nullable(),
    });
    const response = await new OpenAI({ apiKey: this.apiKey }).responses.parse({
      model: this.model,
      input: [
        {
          role: "developer",
          content:
            "Privately evaluate this children's story for fidelity to the family brief, causal structure, ages 7–10 parent-read-aloud fit, oral flow, and safety. Choose revise only for a material problem. If revision is needed, provide one concise revision brief that preserves strengths and approved details. Return only the structured response.",
        },
        {
          role: "user",
          content: JSON.stringify({ brief, direction, story }),
        },
      ],
      text: { format: zodTextFormat(format, "story_quality_evaluation") },
    });
    if (!response.output_parsed)
      throw new Error("No story quality evaluation returned.");
    return storyQualityEvaluationSchema.parse({
      ...response.output_parsed,
      revisionBrief: response.output_parsed.revisionBrief ?? undefined,
      schemaVersion: 1,
      projectId: brief.projectId,
      storyRevision: story.revision,
      evaluatedAt: this.now().toISOString(),
      model: this.model,
    });
  }

  public async generateVisualPlan(
    brief: ProjectBrief,
    story: StoryPackage,
    options: { revision: number; parentSteering?: string },
  ): Promise<VisualPlanDraft & { model: string }> {
    const response = await new OpenAI({ apiKey: this.apiKey }).responses.parse({
      model: this.model,
      input: [
        {
          role: "developer",
          content:
            "Plan the approved children's story for visual storytelling. Return exactly one spread-map entry for each of the 13 story spreads in order. Track only emotionally important characters. Describe observable, child-readable performance. Preserve every must-keep and avoid boundary. The child protagonist's agency must remain visible; supporting characters must not signal pressure, guilt, accusation, or manipulation unless the approved story explicitly requires and safely resolves it. Images must add action and emotional meaning rather than merely repeat the manuscript.",
        },
        {
          role: "user",
          content: JSON.stringify({
            brief,
            story,
            parentSteering: options.parentSteering,
          }),
        },
      ],
      text: {
        format: zodTextFormat(visualPlanDraftSchema, "visual_story_plan"),
      },
    });
    if (!response.output_parsed)
      throw new Error("No visual story plan returned.");
    return {
      ...visualPlanDraftSchema.parse(response.output_parsed),
      model: this.model,
    };
  }
}
