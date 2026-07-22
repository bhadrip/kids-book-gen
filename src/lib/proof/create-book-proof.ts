import { randomUUID } from "node:crypto";

import type { AppConfig } from "@/lib/config/app-config";
import { FileProjectRepository } from "@/lib/projects/file-project-repository";
import { BookProofService } from "@/lib/proof/book-proof-service";
import { PlaywrightPdfRenderer } from "@/lib/proof/playwright-pdf-renderer";

export function createBookProof(config: AppConfig, now: () => Date) {
  const repository = new FileProjectRepository(config.projectRoot, {
    now,
    createId: randomUUID,
  });
  return new BookProofService(repository, new PlaywrightPdfRenderer(), now);
}
