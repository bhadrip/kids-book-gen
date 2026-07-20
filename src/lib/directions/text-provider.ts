import type {
  ProjectBrief,
  StoryDirection,
  StoryDirections,
  StoryPackage,
} from "@/lib/projects/project";

export interface TextProvider {
  generateDirections(
    brief: ProjectBrief,
    options: { revision: number; parentSteering?: string },
  ): Promise<StoryDirections>;
  generateStory(
    brief: ProjectBrief,
    direction: StoryDirection,
    options: { revision: number; parentSteering?: string },
  ): Promise<StoryPackage>;
}
