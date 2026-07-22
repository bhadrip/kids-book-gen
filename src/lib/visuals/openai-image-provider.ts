import OpenAI, { toFile } from "openai";

import type {
  GeneratedImage,
  ImageProvider,
} from "@/lib/visuals/image-provider";

export class OpenAIImageProvider implements ImageProvider {
  public constructor(
    private readonly apiKey: string,
    private readonly model: string,
  ) {}

  public async generateCharacterDesigns(
    input: Parameters<ImageProvider["generateCharacterDesigns"]>[0],
  ): Promise<[GeneratedImage, GeneratedImage, GeneratedImage]> {
    const character = input.story.characters[0];
    if (!character) throw new Error("The story needs a main character first.");
    const prompt = [
      "Create a children's-book character design sheet on a simple light background.",
      "Show the same character in front, three-quarter, side, and back views, with two expressive face studies.",
      `Character: ${character.name}. ${character.description}`,
      `Family must-keep details: ${input.brief.mustKeep ?? "None beyond the approved story."}`,
      `Art direction: ${input.preset.medium}; ${input.preset.line}; ${input.preset.palette}; ${input.preset.shapeLanguage}; ${input.preset.texture}; ${input.preset.detailLevel} detail.`,
      `Avoid: ${input.preset.avoid.join(", ")}.`,
      "Keep identity, clothing, colors, proportions, and signature features consistent across every view.",
      "Do not imitate a named artist. Do not include words, labels, letters, typography, frames, or a book layout.",
    ].join("\n");
    const result = await new OpenAI({ apiKey: this.apiKey }).images.generate({
      model: this.model,
      prompt,
      n: 3,
      size: "1024x1024",
      quality: "low",
      output_format: "png",
    });
    const images = result.data ?? [];
    if (images.length !== 3)
      throw new Error("The image provider did not return three designs.");
    const generated = images.map((image, index): GeneratedImage => {
      if (!image.b64_json)
        throw new Error("The image provider returned an empty design.");
      return {
        bytes: Buffer.from(image.b64_json, "base64"),
        extension: "png" as const,
        mimeType: "image/png" as const,
        model: this.model,
        altText: `${character.name} character design ${index + 1} in the ${input.preset.label.toLowerCase()} look.`,
      };
    });
    const [first, second, third] = generated;
    if (!first || !second || !third)
      throw new Error("The image provider did not return three designs.");
    return [first, second, third];
  }

  public async generateSampleSpread(
    input: Parameters<ImageProvider["generateSampleSpread"]>[0],
  ): Promise<GeneratedImage> {
    const spread = input.story.spreads[6];
    if (!spread) throw new Error("The story is missing spread 7.");
    const reference = await toFile(
      Buffer.from(input.reference.bytes),
      "character-reference.png",
      { type: input.reference.mimeType },
    );
    const prompt = [
      "Create one polished landscape children's-book illustration using the supplied character reference.",
      `Story beat: ${spread.beat}`,
      `Narrative context: ${spread.text}`,
      `Character and world rules: ${JSON.stringify(input.visualBible)}`,
      `Art direction: ${input.preset.medium}; ${input.preset.line}; ${input.preset.palette}; ${input.preset.lighting}; ${input.preset.shapeLanguage}; ${input.preset.texture}.`,
      `Requested change: ${input.parentFeedback ?? "None; make the first representative sample."}`,
      "Preserve the exact recurring character identity and signature details from the reference.",
      `Leave calm, low-detail negative space in the ${input.visualBible.textSafeArea.replace("_", " ")} for a separate HTML text layer.`,
      "Do not render any words, letters, typography, captions, borders, mockups, or page numbers inside the image.",
      `Avoid: ${input.visualBible.avoid.join(", ")}. Do not imitate a named artist.`,
    ].join("\n");
    const result = await new OpenAI({ apiKey: this.apiKey }).images.edit({
      model: this.model,
      image: reference,
      prompt,
      n: 1,
      size: "1536x1024",
      quality: "medium",
      output_format: "png",
    });
    const encoded = result.data?.[0]?.b64_json;
    if (!encoded)
      throw new Error("The image provider returned an empty sample.");
    return {
      bytes: Buffer.from(encoded, "base64"),
      extension: "png",
      mimeType: "image/png",
      model: this.model,
      altText: `Illustration for spread 7, ${spread.beat}, with the approved character and room for the story text.`,
    };
  }
}
