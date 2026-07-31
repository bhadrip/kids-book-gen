import { randomUUID } from "node:crypto";

import type { AppConfig } from "@/lib/config/app-config";
import { createTextProvider } from "@/lib/directions/create-text-provider";
import { FileProjectRepository } from "@/lib/projects/file-project-repository";
import { VisualNarrativeWorkflowService } from "@/lib/visuals/visual-narrative-workflow-service";

export async function createVisualNarrativeWorkflow(
  config: AppConfig,
  now: () => Date,
) {
  const repository = new FileProjectRepository(config.projectRoot, {
    now,
    createId: randomUUID,
  });
  return new VisualNarrativeWorkflowService(
    repository,
    await createTextProvider(config, now),
    now,
  );
}
