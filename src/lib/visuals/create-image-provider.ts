import type { AppConfig } from "@/lib/config/app-config";
import { FixtureImageProvider } from "@/lib/visuals/fixture-image-provider";
import type { ImageProvider } from "@/lib/visuals/image-provider";

export async function createImageProvider(
  config: AppConfig,
): Promise<ImageProvider> {
  if (config.imageProvider === "fixture")
    return new FixtureImageProvider(config.fixtureDelayMs);
  if (!config.openAiApiKey)
    return {
      generateCharacterDesigns: async () => {
        throw new Error("OPENAI_API_KEY is required for image generation.");
      },
      generateSampleSpread: async () => {
        throw new Error("OPENAI_API_KEY is required for image generation.");
      },
      generateBookPage: async () => {
        throw new Error("OPENAI_API_KEY is required for image generation.");
      },
    };
  const { OpenAIImageProvider } =
    await import("@/lib/visuals/openai-image-provider");
  return new OpenAIImageProvider(config.openAiApiKey, config.imageModel);
}
