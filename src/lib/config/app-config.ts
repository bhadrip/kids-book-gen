import { z } from "zod";

const optionalString = z.string().trim().min(1).optional();

export const appConfigSchema = z.object({
  openAiApiKey: optionalString,
  textModel: z.string().trim().min(1).default("gpt-5.6-luna"),
  imageModel: z.string().trim().min(1).default("gpt-image-2"),
  projectRoot: z.string().trim().min(1).default("data/projects"),
  characterLibraryRoot: z.string().trim().min(1).default("data/characters"),
  bookBudgetUsd: z.coerce.number().positive().default(3),
  finalImageEstimateUsd: z.coerce.number().positive().default(0.18),
  textProvider: z.enum(["openai", "fixture"]).default("openai"),
  imageProvider: z.enum(["openai", "fixture"]).default("openai"),
  fixtureDelayMs: z.coerce.number().int().min(0).max(5_000).default(0),
});

export type AppConfig = z.infer<typeof appConfigSchema>;

export function readAppConfig(
  environment: Readonly<Record<string, string | undefined>>,
): AppConfig {
  return appConfigSchema.parse({
    openAiApiKey: environment.OPENAI_API_KEY,
    textModel: environment.KIDS_BOOK_TEXT_MODEL,
    imageModel: environment.KIDS_BOOK_IMAGE_MODEL,
    projectRoot: environment.KIDS_BOOK_PROJECT_ROOT,
    characterLibraryRoot: environment.KIDS_BOOK_CHARACTER_LIBRARY_ROOT,
    bookBudgetUsd: environment.KIDS_BOOK_BOOK_BUDGET_USD,
    finalImageEstimateUsd: environment.KIDS_BOOK_FINAL_IMAGE_ESTIMATE_USD,
    textProvider: environment.KIDS_BOOK_TEXT_PROVIDER,
    imageProvider: environment.KIDS_BOOK_IMAGE_PROVIDER,
    fixtureDelayMs: environment.KIDS_BOOK_FIXTURE_DELAY_MS,
  });
}
