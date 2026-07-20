import { randomUUID } from "node:crypto";

import type { AppConfig } from "@/lib/config/app-config";
import { createTextProvider } from "@/lib/directions/create-text-provider";
import { StoryWorkflowService } from "@/lib/directions/story-workflow-service";
import { FileProjectRepository } from "@/lib/projects/file-project-repository";

export async function createStoryWorkflow(config: AppConfig, now: () => Date) {
  const repository = new FileProjectRepository(config.projectRoot, {
    now,
    createId: randomUUID,
  });
  return new StoryWorkflowService(
    repository,
    await createTextProvider(config, now),
    now,
  );
}
