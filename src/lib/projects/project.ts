import { z } from "zod";
import { readerConfigurationSchema } from "@/lib/readers/reader-profile";

export const projectIdSchema = z.string().uuid();

export const projectSchema = z.object({
  schemaVersion: z.literal(1),
  id: projectIdSchema,
  title: z.string().trim().min(1).max(120),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Project = z.infer<typeof projectSchema>;

export const createProjectInputSchema = z.object({
  title: z.string().trim().min(1, "Enter a project title.").max(120),
});

export type CreateProjectInput = z.infer<typeof createProjectInputSchema>;

const optionalText = (maximum: number) =>
  z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().trim().min(1).max(maximum).optional(),
  );

export const narrativeTemplateSchema = z.enum([
  "mystery_and_reveal",
  "mission_with_obstacles",
  "try_fail_change_plan",
  "two_sides_to_understand",
  "feeling_changes_shape",
  "help_me_choose",
  "start_from_scratch",
]);

export const projectBriefSchema = z.object({
  schemaVersion: z.literal(1),
  projectId: projectIdSchema,
  template: narrativeTemplateSchema,
  originalIdea: z.string().trim().min(10).max(2_000),
  protagonist: optionalText(160),
  characterDesire: optionalText(500),
  desiredFeeling: optionalText(300),
  valueOrQuestion: optionalText(500),
  avoid: optionalText(500),
  mustKeep: optionalText(1_000),
  readerConfiguration: readerConfigurationSchema.optional(),
  createdAt: z.string().datetime(),
});

export type ProjectBrief = z.infer<typeof projectBriefSchema>;

export const storyDirectionSchema = z.object({
  title: z.string().trim().min(1).max(120),
  storyEngine: z.string().trim().min(1).max(120),
  promise: z.string().trim().min(1).max(500),
  opening: z.string().trim().min(1).max(500),
  ending: z.string().trim().min(1).max(500),
});
export type StoryDirection = z.infer<typeof storyDirectionSchema>;

export const storyDirectionsSchema = z
  .object({
    schemaVersion: z.literal(1),
    projectId: projectIdSchema,
    sourceBriefCreatedAt: z.string().datetime(),
    generatedAt: z.string().datetime(),
    model: z.string().trim().min(1),
    revision: z.number().int().positive().default(1),
    parentSteering: optionalText(1_000),
    readerConfiguration: readerConfigurationSchema.optional(),
    directions: z.array(storyDirectionSchema).length(3),
  })
  .superRefine((value, context) => {
    if (
      new Set(value.directions.map((direction) => direction.title)).size !== 3
    )
      context.addIssue({
        code: "custom",
        message: "Direction titles must be distinct.",
        path: ["directions"],
      });
    if (
      new Set(value.directions.map((direction) => direction.storyEngine))
        .size !== 3
    )
      context.addIssue({
        code: "custom",
        message: "Story engines must be distinct.",
        path: ["directions"],
      });
  });

export type StoryDirections = z.infer<typeof storyDirectionsSchema>;

export const selectedDirectionSchema = z.object({
  schemaVersion: z.literal(1),
  projectId: projectIdSchema,
  directionTitle: z.string().trim().min(1).max(120),
  directionsRevision: z.number().int().positive().default(1),
  parentFeedback: optionalText(1_000),
  selectedAt: z.string().datetime(),
});

export const storyPackageSchema = z.object({
  schemaVersion: z.literal(1),
  projectId: projectIdSchema,
  generatedAt: z.string().datetime(),
  model: z.string().trim().min(1),
  revision: z.number().int().positive(),
  sourceDirectionTitle: z.string().trim().min(1),
  parentSteering: optionalText(1_000),
  readerConfiguration: readerConfigurationSchema.optional(),
  title: z.string().trim().min(1).max(120),
  characters: z
    .array(
      z.object({
        name: z.string().trim().min(1),
        role: z.string().trim().min(1),
        description: z.string().trim().min(1),
      }),
    )
    .min(1),
  promise: z.string().trim().min(1),
  arc: z.object({
    beginning: z.string().trim().min(1),
    middle: z.string().trim().min(1),
    ending: z.string().trim().min(1),
  }),
  spreads: z
    .array(
      z.object({
        number: z.number().int().min(1).max(13),
        beat: z.string().trim().min(1),
        text: z.string().trim().min(1),
      }),
    )
    .length(13),
});
export type StoryPackage = z.infer<typeof storyPackageSchema>;

export const storyQualityEvaluationSchema = z.object({
  schemaVersion: z.literal(1),
  projectId: projectIdSchema,
  storyRevision: z.number().int().positive(),
  evaluatedAt: z.string().datetime(),
  model: z.string().trim().min(1),
  readerConfiguration: readerConfigurationSchema.optional(),
  readerProfileVersion: z.literal("reader-profiles-v1").optional(),
  verdict: z.enum(["pass", "revise"]),
  checks: z.object({
    fidelity: z.enum(["pass", "revise"]),
    structure: z.enum(["pass", "revise"]),
    ageFit: z.enum(["pass", "revise"]),
    oralFlow: z.enum(["pass", "revise"]),
    safety: z.enum(["pass", "revise"]),
  }),
  revisionBrief: optionalText(1_500),
});
export type StoryQualityEvaluation = z.infer<
  typeof storyQualityEvaluationSchema
>;

export const storyDecisionSchema = z.object({
  schemaVersion: z.literal(1),
  projectId: projectIdSchema,
  storyRevision: z.number().int().positive(),
  status: z.enum(["approved", "revision_requested"]),
  feedback: optionalText(1_000),
  decidedAt: z.string().datetime(),
});
export type StoryDecision = z.infer<typeof storyDecisionSchema>;

export const textGenerationJobSchema = z.object({
  schemaVersion: z.literal(1),
  projectId: projectIdSchema,
  jobKey: z.string().trim().min(1).max(120),
  kind: z.enum([
    "directions",
    "directions_revision",
    "story",
    "story_revision",
  ]),
  status: z.enum(["in_progress", "completed", "failed"]),
  stage: z.string().trim().min(1).max(240),
  lastSavedArtifact: z.string().trim().min(1).max(240),
  startedAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  failureMessage: optionalText(500),
});
export type TextGenerationJob = z.infer<typeof textGenerationJobSchema>;

export interface ProjectDependencies {
  now: () => Date;
  createId: () => string;
}

export function createProject(
  input: CreateProjectInput,
  dependencies: ProjectDependencies,
): Project {
  const title = createProjectInputSchema.parse(input).title;
  const now = dependencies.now().toISOString();

  return projectSchema.parse({
    schemaVersion: 1,
    id: dependencies.createId(),
    title,
    createdAt: now,
    updatedAt: now,
  });
}
