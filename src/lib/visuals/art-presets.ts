import { z } from "zod";

export const artPresetIdSchema = z.enum([
  "warm_handmade_v1",
  "bold_funny_v1",
  "magical_luminous_v1",
  "graphic_adventure_v1",
  "quiet_emotional_v1",
  "detailed_discovery_v1",
]);

export type ArtPresetId = z.infer<typeof artPresetIdSchema>;

export type ArtPreset = {
  id: ArtPresetId;
  label: string;
  shortDescription: string;
  medium: string;
  line: string;
  palette: string;
  lighting: string;
  shapeLanguage: string;
  texture: string;
  detailLevel: string;
  avoid: readonly string[];
  swatches: readonly [string, string, string];
};

export const artPresets: readonly ArtPreset[] = [
  {
    id: "warm_handmade_v1",
    label: "Warm and handmade",
    shortDescription:
      "Soft watercolor, pencil marks, and friendly rounded forms.",
    medium: "watercolor with colored pencil",
    line: "soft, loose, variable pencil line",
    palette: "sun-warmed coral, ochre, leaf green, and sky blue",
    lighting: "soft natural light with low contrast",
    shapeLanguage: "rounded characters and organic environments",
    texture: "visible paper grain and handmade edges",
    detailLevel: "medium",
    avoid: ["photorealism", "plastic 3D surfaces", "busy backgrounds"],
    swatches: ["#d77a61", "#e8c07d", "#77a88d"],
  },
  {
    id: "bold_funny_v1",
    label: "Bold and funny",
    shortDescription:
      "Chunky ink, elastic expressions, and punchy playful color.",
    medium: "gouache with bold digital ink",
    line: "thick, energetic, expressive contour",
    palette: "tomato red, bright yellow, turquoise, and inky navy",
    lighting: "flat graphic light with crisp contrast",
    shapeLanguage: "squash-and-stretch silhouettes and comic exaggeration",
    texture: "dry-brush marks with clean color blocks",
    detailLevel: "low to medium",
    avoid: ["photorealism", "subdued expressions", "tiny decorative clutter"],
    swatches: ["#e85d3f", "#f4c542", "#1b9aaa"],
  },
  {
    id: "magical_luminous_v1",
    label: "Magical and luminous",
    shortDescription:
      "Glowing color, dreamy depth, and a gentle sense of wonder.",
    medium: "layered digital painting with watercolor bloom",
    line: "delicate edges with selective luminous contours",
    palette: "indigo, violet, moonlit teal, and warm gold",
    lighting: "glowing sources, soft haze, and rich shadow",
    shapeLanguage: "flowing silhouettes and star-like motifs",
    texture: "mist, pigment bloom, and subtle sparkle",
    detailLevel: "medium",
    avoid: ["neon overload", "horror lighting", "photorealism"],
    swatches: ["#3d348b", "#56a3a6", "#f6bd60"],
  },
  {
    id: "graphic_adventure_v1",
    label: "Graphic adventure",
    shortDescription:
      "Clear silhouettes, dynamic angles, and energetic page turns.",
    medium: "screen-print-inspired digital illustration",
    line: "crisp angular line with bold silhouette breaks",
    palette: "rust orange, forest green, cream, and deep blue",
    lighting: "directional light with graphic shadow shapes",
    shapeLanguage: "triangles, diagonals, and confident action poses",
    texture: "subtle ink grain and offset-print character",
    detailLevel: "medium",
    avoid: ["muddy values", "static centered poses", "photorealism"],
    swatches: ["#c65d3b", "#436b52", "#243b53"],
  },
  {
    id: "quiet_emotional_v1",
    label: "Quiet and emotional",
    shortDescription: "Tender gestures, spacious scenes, and calm muted color.",
    medium: "soft pastel and translucent watercolor",
    line: "minimal, sensitive, gently imperfect line",
    palette: "dusty rose, sage, mist blue, and warm cream",
    lighting: "diffuse window light and gentle tonal shifts",
    shapeLanguage: "simple grounded forms with expressive negative space",
    texture: "soft paper tooth and feathered pigment",
    detailLevel: "low to medium",
    avoid: ["melodramatic expressions", "harsh contrast", "visual clutter"],
    swatches: ["#c99da3", "#9caf9b", "#9db7c5"],
  },
  {
    id: "detailed_discovery_v1",
    label: "Detailed discovery",
    shortDescription:
      "Layered environments packed with clues worth revisiting.",
    medium: "fine ink with transparent watercolor",
    line: "precise varied line with readable small forms",
    palette: "moss, clay, lake blue, berry, and parchment",
    lighting: "clear daylight with localized pools of attention",
    shapeLanguage: "observational forms and nested pathways",
    texture: "fine hatching, paper, wood, stone, and foliage",
    detailLevel: "high but organized",
    avoid: ["random clutter", "hidden focal point", "photorealism"],
    swatches: ["#677a52", "#b66a50", "#4e8098"],
  },
] as const;

export function getArtPreset(id: ArtPresetId): ArtPreset {
  const preset = artPresets.find((candidate) => candidate.id === id);
  if (!preset) throw new Error("Choose one of the six available art looks.");
  return preset;
}
