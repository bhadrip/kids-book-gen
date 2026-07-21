import type {
  ProjectBrief,
  StoryDirection,
  StoryDirections,
  StoryEvaluation,
  StoryPackage,
} from "@/lib/projects/project";

export interface StoryGenerationOptions {
  revision: number;
  parentSteering?: string;
  sourceStory?: StoryPackage;
  qualityRevision?: {
    instructions: string[];
    preserve: string[];
  };
}

export interface TextProvider {
  generateDirections(
    brief: ProjectBrief,
    options: { revision: number; parentSteering?: string },
  ): Promise<StoryDirections>;
  generateStory(
    brief: ProjectBrief,
    direction: StoryDirection,
    options: StoryGenerationOptions,
  ): Promise<StoryPackage>;
  evaluateStory(
    brief: ProjectBrief,
    story: StoryPackage,
  ): Promise<StoryEvaluation>;
}
