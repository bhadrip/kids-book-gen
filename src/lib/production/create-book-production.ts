import { randomUUID } from "node:crypto";

import type { AppConfig } from "@/lib/config/app-config";
import { FileProjectRepository } from "@/lib/projects/file-project-repository";
import { BookProductionService } from "@/lib/production/book-production-service";
import { createImageProvider } from "@/lib/visuals/create-image-provider";

export async function createBookProduction(config: AppConfig, now: () => Date) {
  const repository = new FileProjectRepository(config.projectRoot, {
    now,
    createId: randomUUID,
  });
  return new BookProductionService(
    repository,
    await createImageProvider(config),
    now,
    {
      softBudgetUsd: config.bookBudgetUsd,
      finalImageEstimateUsd: config.finalImageEstimateUsd,
    },
  );
}
