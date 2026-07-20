import { z } from "zod";

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
