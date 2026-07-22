import { z } from "zod";

import { artPresetIdSchema } from "@/lib/visuals/art-presets";
import { projectIdSchema } from "@/lib/projects/project";

const optionalText = (maximum: number) =>
  z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().trim().min(1).max(maximum).optional(),
  );

export const imageAssetFilenameSchema = z
  .string()
  .regex(/^[a-z0-9][a-z0-9._-]{0,119}\.(png|webp|jpe?g|svg)$/);

export const characterDesignsSchema = z.object({
  schemaVersion: z.literal(1),
  projectId: projectIdSchema,
  revision: z.number().int().positive(),
  sourceStoryRevision: z.number().int().positive(),
  presetId: artPresetIdSchema,
  generatedAt: z.string().datetime(),
  model: z.string().trim().min(1),
  options: z
    .array(
      z.object({
        id: z.string().regex(/^character-[1-3]$/),
        assetFilename: imageAssetFilenameSchema,
        altText: z.string().trim().min(1).max(500),
      }),
    )
    .length(3),
});
export type CharacterDesigns = z.infer<typeof characterDesignsSchema>;

export const selectedCharacterSchema = z.object({
  schemaVersion: z.literal(1),
  projectId: projectIdSchema,
  characterDesignRevision: z.number().int().positive(),
  optionId: z.string().regex(/^character-[1-3]$/),
  sourceAssetFilename: imageAssetFilenameSchema,
  referenceAssetFilename: imageAssetFilenameSchema,
  selectedAt: z.string().datetime(),
});
export type SelectedCharacter = z.infer<typeof selectedCharacterSchema>;

export const visualBibleSchema = z.object({
  schemaVersion: z.literal(1),
  projectId: projectIdSchema,
  sourceStoryRevision: z.number().int().positive(),
  presetId: artPresetIdSchema,
  characterReference: imageAssetFilenameSchema,
  createdAt: z.string().datetime(),
  mainCharacter: z.object({
    name: z.string().trim().min(1).max(120),
    description: z.string().trim().min(1).max(1_000),
    identityInvariants: z.array(z.string().trim().min(1)).min(2).max(8),
  }),
  signatureProps: z.array(z.string().trim().min(1)).max(8),
  locations: z.array(z.string().trim().min(1)).min(1).max(8),
  palette: z.array(z.string().trim().min(1)).length(3),
  textSafeArea: z.enum([
    "upper_left",
    "upper_right",
    "lower_left",
    "lower_right",
  ]),
  avoid: z.array(z.string().trim().min(1)).min(1).max(10),
});
export type VisualBible = z.infer<typeof visualBibleSchema>;

export const sampleSpreadSchema = z.object({
  schemaVersion: z.literal(1),
  projectId: projectIdSchema,
  revision: z.number().int().positive(),
  sourceStoryRevision: z.number().int().positive(),
  spreadNumber: z.literal(7),
  beat: z.string().trim().min(1).max(1_000),
  text: z.string().trim().min(1).max(3_000),
  textSource: z
    .enum(["approved_story", "parent_edited"])
    .default("approved_story"),
  assetFilename: imageAssetFilenameSchema,
  altText: z.string().trim().min(1).max(500),
  generatedAt: z.string().datetime(),
  model: z.string().trim().min(1),
  parentFeedback: optionalText(1_000),
  textEditedAt: z.string().datetime().optional(),
});
export type SampleSpread = z.infer<typeof sampleSpreadSchema>;

export const visualDecisionSchema = z.object({
  schemaVersion: z.literal(1),
  projectId: projectIdSchema,
  sampleRevision: z.number().int().positive(),
  status: z.enum(["approved", "change_requested"]),
  feedback: optionalText(1_000),
  decidedAt: z.string().datetime(),
});
export type VisualDecision = z.infer<typeof visualDecisionSchema>;

export const imageGenerationJobSchema = z.object({
  schemaVersion: z.literal(1),
  projectId: projectIdSchema,
  jobKey: z.string().trim().min(1).max(120),
  kind: z.enum(["character_designs", "sample_spread", "sample_revision"]),
  status: z.enum(["in_progress", "completed", "failed"]),
  stage: z.string().trim().min(1).max(240),
  lastSavedArtifact: z.string().trim().min(1).max(240),
  startedAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  failureMessage: optionalText(500),
});
export type ImageGenerationJob = z.infer<typeof imageGenerationJobSchema>;
