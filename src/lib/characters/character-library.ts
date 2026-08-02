import { z } from "zod";

import { projectIdSchema } from "@/lib/projects/project";
import { artPresetIdSchema } from "@/lib/visuals/art-presets";
import { imageAssetFilenameSchema } from "@/lib/visuals/visual-artifacts";

export const libraryCharacterIdSchema = z.string().uuid();

export const libraryCharacterSchema = z.object({
  schemaVersion: z.literal(1),
  id: libraryCharacterIdSchema,
  revision: z.number().int().positive(),
  displayName: z.string().trim().min(1).max(120),
  status: z.enum(["approved", "archived"]),
  visibility: z.enum(["private", "shared"]),
  identity: z.object({
    description: z.string().trim().min(1).max(1_000),
    identityInvariants: z.array(z.string().trim().min(1)).min(2).max(8),
    avoid: z.array(z.string().trim().min(1)).min(1).max(10),
  }),
  rendition: z.object({
    presetId: artPresetIdSchema,
    referenceAssetFilename: imageAssetFilenameSchema,
    model: z.string().trim().min(1),
  }),
  origin: z.object({
    projectId: projectIdSchema,
    storyRevision: z.number().int().positive(),
    characterDesignRevision: z.number().int().positive(),
    optionId: z.string().regex(/^character-[1-3]$/),
  }),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type LibraryCharacter = z.infer<typeof libraryCharacterSchema>;
