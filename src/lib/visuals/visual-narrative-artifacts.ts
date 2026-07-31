import { z } from "zod";

import { projectIdSchema } from "@/lib/projects/project";

const optionalText = (maximum: number) =>
  z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().trim().min(1).max(maximum).optional(),
  );

const spreadNumberSchema = z.number().int().min(1).max(13);

export const emotionalBeatSchema = z.object({
  spreadNumber: spreadNumberSchema,
  enteringState: z.string().trim().min(1).max(120),
  trigger: z.string().trim().min(1).max(500),
  outwardExpression: z.string().trim().min(1).max(500),
  leavingState: z.string().trim().min(1).max(120),
  intensity: z.enum(["low", "medium", "high"]),
  avoidSignals: z.array(z.string().trim().min(1).max(240)).max(6),
});

export const emotionalArcCharacterSchema = z.object({
  characterName: z.string().trim().min(1).max(120),
  beats: z.array(emotionalBeatSchema).min(1).max(13),
});

export const emotionalArcSchema = z.object({
  schemaVersion: z.literal(1),
  projectId: projectIdSchema,
  revision: z.number().int().positive(),
  sourceStoryRevision: z.number().int().positive(),
  generatedAt: z.string().datetime(),
  model: z.string().trim().min(1),
  characters: z.array(emotionalArcCharacterSchema).min(1).max(8),
});
export type EmotionalArc = z.infer<typeof emotionalArcSchema>;

export const spreadMapEntrySchema = z.object({
  spreadNumber: spreadNumberSchema,
  storyBeat: z.string().trim().min(1).max(1_000),
  storyJob: z.string().trim().min(1).max(500),
  mainAction: z.string().trim().min(1).max(500),
  emotionalMovement: z.string().trim().min(1).max(500),
  illustrationIntent: z.string().trim().min(1).max(1_000),
  mustShow: z.array(z.string().trim().min(1).max(500)).max(8),
  mustAvoid: z.array(z.string().trim().min(1).max(500)).max(8),
  pageTurnQuestion: z.string().trim().min(1).max(500),
});

export const spreadMapSchema = z
  .object({
    schemaVersion: z.literal(1),
    projectId: projectIdSchema,
    revision: z.number().int().positive(),
    sourceStoryRevision: z.number().int().positive(),
    sourceEmotionalArcRevision: z.number().int().positive(),
    generatedAt: z.string().datetime(),
    model: z.string().trim().min(1),
    parentSteering: optionalText(1_000),
    spreads: z.array(spreadMapEntrySchema).length(13),
  })
  .superRefine((value, context) => {
    value.spreads.forEach((spread, index) => {
      if (spread.spreadNumber !== index + 1)
        context.addIssue({
          code: "custom",
          message: "Spread map entries must cover spreads 1–13 in order.",
          path: ["spreads", index, "spreadNumber"],
        });
    });
  });
export type SpreadMap = z.infer<typeof spreadMapSchema>;

export const visualPlanDecisionSchema = z.object({
  schemaVersion: z.literal(1),
  projectId: projectIdSchema,
  spreadMapRevision: z.number().int().positive(),
  status: z.enum(["approved", "change_requested"]),
  feedback: optionalText(1_000),
  decidedAt: z.string().datetime(),
});
export type VisualPlanDecision = z.infer<typeof visualPlanDecisionSchema>;

export const visualPlanJobSchema = z.object({
  schemaVersion: z.literal(1),
  projectId: projectIdSchema,
  jobKey: z.string().trim().min(1).max(120),
  status: z.enum(["in_progress", "completed", "failed"]),
  stage: z.string().trim().min(1).max(240),
  lastSavedArtifact: z.string().trim().min(1).max(240),
  startedAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  failureMessage: optionalText(500),
});
export type VisualPlanJob = z.infer<typeof visualPlanJobSchema>;

export const visualPlanDraftSchema = z.object({
  emotionalArc: z.object({
    characters: z.array(emotionalArcCharacterSchema).min(1).max(8),
  }),
  spreadMap: z.object({
    spreads: z.array(spreadMapEntrySchema).length(13),
  }),
});
export type VisualPlanDraft = z.infer<typeof visualPlanDraftSchema>;

export function visualPlanIsCurrent(input: {
  storyRevision: number;
  emotionalArc: EmotionalArc | null;
  spreadMap: SpreadMap | null;
  decision: VisualPlanDecision | null;
}): boolean {
  const { storyRevision, emotionalArc, spreadMap, decision } = input;
  return Boolean(
    emotionalArc &&
    spreadMap &&
    decision?.status === "approved" &&
    emotionalArc.sourceStoryRevision === storyRevision &&
    spreadMap.sourceStoryRevision === storyRevision &&
    spreadMap.sourceEmotionalArcRevision === emotionalArc.revision &&
    decision.spreadMapRevision === spreadMap.revision,
  );
}
