import type { AppConfig } from "@/lib/config/app-config";
import { FixtureTextProvider } from "@/lib/directions/fixture-text-provider";
import type { TextProvider } from "@/lib/directions/text-provider";

export async function createTextProvider(
  config: AppConfig,
  now: () => Date,
): Promise<TextProvider> {
  if (config.textProvider === "fixture")
    return new FixtureTextProvider(now, config.fixtureDelayMs);
  if (!config.openAiApiKey)
    return {
      generateDirections: async () => {
        throw new Error("OPENAI_API_KEY is required for text generation.");
      },
      generateStory: async () => {
        throw new Error("OPENAI_API_KEY is required for text generation.");
      },
    };
  const { OpenAITextProvider } =
    await import("@/lib/directions/openai-text-provider");
  return new OpenAITextProvider(config.openAiApiKey, config.textModel, now);
}
