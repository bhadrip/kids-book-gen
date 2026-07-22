import { z } from "zod";

import { projectIdSchema } from "@/lib/projects/project";
import { bookPageIdSchema } from "@/lib/production/production-artifacts";

const optionalText = (maximum: number) =>
  z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().trim().min(1).max(maximum).optional(),
  );

const proofFilenameSchema = z
  .string()
  .regex(/^proof(?:-r\d{2,})?\.(html|pdf)$/);

export const bookProofSchema = z
  .object({
    schemaVersion: z.literal(1),
    projectId: projectIdSchema,
    revision: z.number().int().positive(),
    sourceBookDecisionRevision: z.number().int().positive(),
    pageRevisions: z
      .array(
        z.object({
          pageId: bookPageIdSchema,
          revision: z.number().int().positive(),
        }),
      )
      .length(16),
    status: z.enum(["ready", "exported"]),
    layoutStatus: z.enum(["not_checked", "passed", "failed"]),
    layoutIssuePageIds: z.array(bookPageIdSchema),
    htmlFilename: proofFilenameSchema,
    pdfFilename: proofFilenameSchema.optional(),
    createdAt: z.string().datetime(),
    exportedAt: z.string().datetime().optional(),
  })
  .superRefine((proof, context) => {
    if (new Set(proof.pageRevisions.map((page) => page.pageId)).size !== 16)
      context.addIssue({
        code: "custom",
        message: "A proof must contain every book page exactly once.",
        path: ["pageRevisions"],
      });
    if (
      proof.status === "exported" &&
      (!proof.pdfFilename ||
        !proof.exportedAt ||
        proof.layoutStatus !== "passed")
    )
      context.addIssue({
        code: "custom",
        message: "An exported proof requires a passed PDF artifact.",
        path: ["status"],
      });
    if (
      proof.layoutStatus === "failed" &&
      proof.layoutIssuePageIds.length === 0
    )
      context.addIssue({
        code: "custom",
        message: "A failed layout check must identify an affected page.",
        path: ["layoutIssuePageIds"],
      });
  });
export type BookProof = z.infer<typeof bookProofSchema>;

export const readingFeedbackInputSchema = z.object({
  favoritePart: z
    .string()
    .trim()
    .min(1, "Share the favorite part of the reading.")
    .max(1_000),
  confusion: optionalText(1_000),
  completion: z.enum(["finished", "stopped_early"]),
  ideaFidelityRating: z.coerce.number().int().min(1).max(5),
  rereadInterest: z.enum(["yes", "maybe", "no"]),
  sequelInterest: z.enum(["yes", "maybe", "no"]),
});
export type ReadingFeedbackInput = z.infer<typeof readingFeedbackInputSchema>;

export const readingFeedbackSchema = readingFeedbackInputSchema.extend({
  schemaVersion: z.literal(1),
  projectId: projectIdSchema,
  revision: z.number().int().positive(),
  sourceProofRevision: z.number().int().positive(),
  submittedAt: z.string().datetime(),
});
export type ReadingFeedback = z.infer<typeof readingFeedbackSchema>;

export const pilotSummarySchema = z.object({
  schemaVersion: z.literal(1),
  projectId: projectIdSchema,
  sourceFeedbackRevision: z.number().int().positive(),
  calculatedAt: z.string().datetime(),
  minutesFromProjectStartToFeedback: z.number().int().nonnegative(),
  finalPageRegenerationCount: z.number().int().nonnegative(),
  estimatedBookCostUsd: z.number().nonnegative(),
  ideaFidelityRating: z.number().int().min(1).max(5),
  readingCompleted: z.boolean(),
  rereadInterest: z.enum(["yes", "maybe", "no"]),
  sequelInterest: z.enum(["yes", "maybe", "no"]),
});
export type PilotSummary = z.infer<typeof pilotSummarySchema>;
