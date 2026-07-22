import { randomUUID } from "node:crypto";

import type { AppConfig } from "@/lib/config/app-config";
import { FileProjectRepository } from "@/lib/projects/file-project-repository";
import { createImageProvider } from "@/lib/visuals/create-image-provider";
import { VisualWorkflowService } from "@/lib/visuals/visual-workflow-service";

export async function createVisualWorkflow(config: AppConfig, now: () => Date) {
  const repository = new FileProjectRepository(config.projectRoot, {
    now,
    createId: randomUUID,
  });
  return new VisualWorkflowService(
    repository,
    await createImageProvider(config),
    now,
  );
}
