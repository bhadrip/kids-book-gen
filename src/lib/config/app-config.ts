import { z } from "zod";

const optionalString = z.string().trim().min(1).optional();

export const appConfigSchema = z.object({
  openAiApiKey: optionalString,
  textModel: z.string().trim().min(1).default("gpt-5.6-luna"),
  imageModel: z.string().trim().min(1).default("gpt-image-2"),
  projectRoot: z.string().trim().min(1).default("data/projects"),
  bookBudgetUsd: z.coerce.number().positive().default(3),
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
    bookBudgetUsd: environment.KIDS_BOOK_BOOK_BUDGET_USD,
  });
}
