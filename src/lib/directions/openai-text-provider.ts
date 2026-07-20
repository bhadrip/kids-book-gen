import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import type { TextProvider } from "@/lib/directions/text-provider";
import {
  storyDirectionsSchema,
  storyDirectionSchema,
  storyPackageSchema,
  type ProjectBrief,
  type StoryDirection,
  type StoryPackage,
  type StoryDirections,
} from "@/lib/projects/project";

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
    options: { revision: number; parentSteering?: string },
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
}
