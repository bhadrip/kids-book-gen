import { z } from "zod";

import { projectIdSchema } from "@/lib/projects/project";
import { imageAssetFilenameSchema } from "@/lib/visuals/visual-artifacts";

const optionalText = (maximum: number) =>
  z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().trim().min(1).max(maximum).optional(),
  );

export const bookPageIdSchema = z.union([
  z.literal("cover"),
  z.literal("title-page"),
  z.string().regex(/^story-(0[1-9]|1[0-3])$/),
  z.literal("end-matter"),
]);
export type BookPageId = z.infer<typeof bookPageIdSchema>;

const bookPageKindSchema = z.enum([
  "cover",
  "front_matter",
  "story",
  "end_matter",
]);
const bookTextSourceSchema = z.enum([
  "approved_story",
  "book_matter",
  "parent_edited",
]);
const textSafeAreaSchema = z.enum([
  "upper_left",
  "upper_right",
  "lower_left",
  "lower_right",
]);

export const bookPlanPageSchema = z.object({
  pageId: bookPageIdSchema,
  sequence: z.number().int().min(1).max(16),
  kind: bookPageKindSchema,
  storySpreadNumber: z.number().int().min(1).max(13).optional(),
  title: z.string().trim().min(1).max(160),
  beat: z.string().trim().min(1).max(1_000),
  text: z.string().trim().min(1).max(3_000),
  textSource: bookTextSourceSchema,
  illustrationDescription: z.string().trim().min(1).max(2_000),
  continuityFacts: z.array(z.string().trim().min(1).max(500)).min(1).max(16),
  requiredReferenceDetails: z
    .array(z.string().trim().min(1).max(500))
    .min(1)
    .max(16),
  textSafeArea: textSafeAreaSchema,
  previousPageId: bookPageIdSchema.optional(),
});
export type BookPlanPage = z.infer<typeof bookPlanPageSchema>;

export const bookPlanSchema = z.object({
  schemaVersion: z.literal(1),
  projectId: projectIdSchema,
  revision: z.number().int().positive(),
  sourceStoryRevision: z.number().int().positive(),
  sourceSampleRevision: z.number().int().positive(),
  pages: z.array(bookPlanPageSchema).length(16),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type BookPlan = z.infer<typeof bookPlanSchema>;

export const bookPlanDecisionSchema = z.object({
  schemaVersion: z.literal(1),
  projectId: projectIdSchema,
  planRevision: z.number().int().positive(),
  status: z.literal("approved"),
  decidedAt: z.string().datetime(),
});
export type BookPlanDecision = z.infer<typeof bookPlanDecisionSchema>;

export const bookDecisionSchema = z.object({
  schemaVersion: z.literal(1),
  projectId: projectIdSchema,
  decisionRevision: z.number().int().positive(),
  status: z.literal("approved"),
  sourceStoryRevision: z.number().int().positive(),
  sourceSampleRevision: z.number().int().positive(),
  sourcePlanRevision: z.number().int().positive(),
  pageRevisions: z
    .array(
      z.object({
        pageId: bookPageIdSchema,
        revision: z.number().int().positive(),
      }),
    )
    .length(16),
  decidedAt: z.string().datetime(),
});
export type BookDecision = z.infer<typeof bookDecisionSchema>;

export const bookPageSchema = z.object({
  schemaVersion: z.literal(1),
  projectId: projectIdSchema,
  pageId: bookPageIdSchema,
  sequence: z.number().int().min(1).max(16),
  kind: bookPageKindSchema,
  storySpreadNumber: z.number().int().min(1).max(13).optional(),
  revision: z.number().int().positive(),
  sourceStoryRevision: z.number().int().positive(),
  sourceSampleRevision: z.number().int().positive(),
  characterReference: imageAssetFilenameSchema,
  title: z.string().trim().min(1).max(160),
  beat: z.string().trim().min(1).max(1_000),
  text: z.string().trim().min(1).max(3_000),
  textSource: bookTextSourceSchema,
  illustrationDescription: optionalText(2_000),
  assetFilename: imageAssetFilenameSchema,
  altText: z.string().trim().min(1).max(500),
  continuityFacts: z.array(z.string().trim().min(1).max(500)).min(1).max(16),
  requiredReferenceDetails: z
    .array(z.string().trim().min(1).max(500))
    .min(1)
    .max(16),
  previousPageId: bookPageIdSchema.optional(),
  status: z.enum(["draft", "kept"]),
  parentFeedback: optionalText(1_000),
  preserveInstructions: optionalText(1_000),
  generatedAt: z.string().datetime(),
  textEditedAt: z.string().datetime().optional(),
  model: z.string().trim().min(1),
  estimatedCostUsd: z.number().nonnegative(),
});
export type BookPage = z.infer<typeof bookPageSchema>;

export const bookActivityEventSchema = z.object({
  id: z.string().trim().min(1).max(120),
  type: z.enum([
    "started",
    "saved",
    "paused",
    "failed",
    "resumed",
    "kept",
    "text_edited",
    "regenerated",
    "book_approved",
    "preflight_completed",
    "proof_exported",
    "feedback_saved",
  ]),
  at: z.string().datetime(),
  message: z.string().trim().min(1).max(500),
  pageId: bookPageIdSchema.optional(),
});
export type BookActivityEvent = z.infer<typeof bookActivityEventSchema>;

export const bookProductionJobSchema = z.object({
  schemaVersion: z.literal(1),
  projectId: projectIdSchema,
  jobKey: z.literal("full-book-production"),
  status: z.enum(["in_progress", "paused", "completed", "failed"]),
  stage: z.string().trim().min(1).max(240),
  totalUnits: z.literal(16),
  completedUnitIds: z.array(bookPageIdSchema).max(16),
  currentUnitId: bookPageIdSchema.optional(),
  failedUnitId: bookPageIdSchema.optional(),
  lastSavedArtifact: z.string().trim().min(1).max(240),
  estimatedTotalCostUsd: z.number().nonnegative(),
  estimatedSpentCostUsd: z.number().nonnegative(),
  softBudgetUsd: z.number().positive(),
  overFiveConfirmed: z.boolean(),
  startedAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  failureMessage: optionalText(500),
  activity: z.array(bookActivityEventSchema).max(500),
});
export type BookProductionJob = z.infer<typeof bookProductionJobSchema>;

export const bookPreflightIssueSchema = z.object({
  code: z.enum([
    "missing_page",
    "empty_text",
    "missing_character_reference",
    "missing_reference_details",
    "missing_continuity_facts",
  ]),
  pageId: bookPageIdSchema,
  message: z.string().trim().min(1).max(500),
});
export type BookPreflightIssue = z.infer<typeof bookPreflightIssueSchema>;

export const bookPreflightSchema = z.object({
  schemaVersion: z.literal(1),
  projectId: projectIdSchema,
  checkedAt: z.string().datetime(),
  status: z.enum(["passed", "failed"]),
  requiredPageIds: z.array(bookPageIdSchema).length(16),
  issues: z.array(bookPreflightIssueSchema),
});
export type BookPreflight = z.infer<typeof bookPreflightSchema>;

export const bookManifestSchema = z.object({
  schemaVersion: z.literal(1),
  projectId: projectIdSchema,
  sourceStoryRevision: z.number().int().positive(),
  sourceSampleRevision: z.number().int().positive(),
  status: z.enum([
    "generating",
    "paused",
    "ready_for_review",
    "needs_attention",
  ]),
  pageIds: z.array(bookPageIdSchema).max(16),
  estimatedSpentCostUsd: z.number().nonnegative(),
  preflightStatus: z.enum(["pending", "passed", "failed"]),
  updatedAt: z.string().datetime(),
});
export type BookManifest = z.infer<typeof bookManifestSchema>;
