import type { ProjectBrief, StoryPackage } from "@/lib/projects/project";
import type { ArtPreset } from "@/lib/visuals/art-presets";
import type { VisualBible } from "@/lib/visuals/visual-artifacts";

export type GeneratedImage = {
  bytes: Uint8Array;
  extension: "png" | "webp" | "jpeg" | "svg";
  mimeType: "image/png" | "image/webp" | "image/jpeg" | "image/svg+xml";
  model: string;
  altText: string;
};

export interface ImageProvider {
  generateCharacterDesigns(input: {
    brief: ProjectBrief;
    story: StoryPackage;
    preset: ArtPreset;
  }): Promise<[GeneratedImage, GeneratedImage, GeneratedImage]>;
  generateSampleSpread(input: {
    story: StoryPackage;
    visualBible: VisualBible;
    preset: ArtPreset;
    reference: { bytes: Uint8Array; mimeType: GeneratedImage["mimeType"] };
    parentFeedback?: string;
  }): Promise<GeneratedImage>;
}
