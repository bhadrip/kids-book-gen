import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import type {
  StoryGenerationOptions,
  TextProvider,
} from "@/lib/directions/text-provider";
import {
  storyDirectionsSchema,
  storyDirectionSchema,
  storyEvaluationSchema,
  storyPackageSchema,
  type ProjectBrief,
  type StoryDirection,
  type StoryPackage,
  type StoryDirections,
  type StoryEvaluation,
} from "@/lib/projects/project";

const directionResponseSchema = z.object({
  directions: z.array(storyDirectionSchema).length(3),
});

const evaluationOutcomeSchema = z.enum([
  "pass",
  "revision_required",
  "escalation_required",
]);

const evaluationDimensionResponseSchema = z.object({
  outcome: evaluationOutcomeSchema,
  evidence: z.array(z.string().trim().min(1).max(500)).min(1).max(3),
  revisionInstruction: z.string().trim().max(500),
});

export const evaluationResponseSchema = z.object({
  outcome: evaluationOutcomeSchema,
  dimensions: z.object({
    ideaFidelity: evaluationDimensionResponseSchema,
    causalStructure: evaluationDimensionResponseSchema,
    ageFit: evaluationDimensionResponseSchema,
    oralFlow: evaluationDimensionResponseSchema,
    safety: evaluationDimensionResponseSchema,
  }),
  preserve: z.array(z.string().trim().min(1).max(500)).max(10),
  revisionInstructions: z.array(z.string().trim().min(1).max(500)).max(5),
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
    options: StoryGenerationOptions,
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
            "Write a safe, warm story package for ages 7–10. Preserve must-keep details. Return exactly 13 concise, non-empty read-aloud spreads. When a source story and bounded quality revision are supplied, change only what the instructions require and preserve the named strengths.",
        },
        {
          role: "user",
          content: JSON.stringify({
            brief,
            direction,
            parentSteering: options.parentSteering,
            sourceStory: options.sourceStory,
            qualityRevision: options.qualityRevision,
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
    story: StoryPackage,
  ): Promise<StoryEvaluation> {
    const response = await new OpenAI({ apiKey: this.apiKey }).responses.parse({
      model: this.model,
      input: [
        {
          role: "developer",
          content:
            "Privately evaluate this children's story for idea fidelity, causal structure, age fit for 7–10, oral read-aloud flow, and safety. Give concise spread-level evidence where possible. Mark uncertain high-risk safety cases escalation_required. If a bounded repair can fix a failure, return revision_required with no more than five precise instructions and name strengths to preserve. Do not rewrite the story and do not invent numeric thresholds.",
        },
        { role: "user", content: JSON.stringify({ brief, story }) },
      ],
      text: {
        format: zodTextFormat(evaluationResponseSchema, "story_evaluation"),
      },
    });
    if (!response.output_parsed)
      throw new Error("No story evaluation returned.");
    const dimensions = Object.fromEntries(
      Object.entries(response.output_parsed.dimensions).map(
        ([name, dimension]) => [
          name,
          {
            ...dimension,
            revisionInstruction: dimension.revisionInstruction || undefined,
          },
        ],
      ),
    );
    return storyEvaluationSchema.parse({
      ...response.output_parsed,
      dimensions,
      schemaVersion: 1,
      projectId: brief.projectId,
      storyRevision: story.revision,
      evaluatedAt: this.now().toISOString(),
      model: this.model,
    });
  }
}
