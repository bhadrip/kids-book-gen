import type {
  ProjectBrief,
  StoryDirection,
  StoryDirections,
  StoryPackage,
  StoryQualityEvaluation,
} from "@/lib/projects/project";
import type { VisualPlanDraft } from "@/lib/visuals/visual-narrative-artifacts";

export interface TextProvider {
  generateDirections(
    brief: ProjectBrief,
    options: { revision: number; parentSteering?: string },
  ): Promise<StoryDirections>;
  generateStory(
    brief: ProjectBrief,
    direction: StoryDirection,
    options: {
      revision: number;
      parentSteering?: string;
      qualityFeedback?: string;
    },
  ): Promise<StoryPackage>;
  evaluateStory(
    brief: ProjectBrief,
    direction: StoryDirection,
    story: StoryPackage,
  ): Promise<StoryQualityEvaluation>;
  generateVisualPlan(
    brief: ProjectBrief,
    story: StoryPackage,
    options: { revision: number; parentSteering?: string },
  ): Promise<VisualPlanDraft & { model: string }>;
}
