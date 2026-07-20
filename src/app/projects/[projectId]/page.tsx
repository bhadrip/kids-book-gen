import Link from "next/link";
import { notFound } from "next/navigation";
import { ZodError } from "zod";

import { ProjectJourney } from "@/components/project-journey";
import { readAppConfig } from "@/lib/config/app-config";
import { FileProjectRepository } from "@/lib/projects/file-project-repository";
import { getProjectProgress } from "@/lib/projects/project-progress";

export const runtime = "nodejs";

async function loadProject(projectId: string) {
  const config = readAppConfig(process.env);
  const repository = new FileProjectRepository(config.projectRoot, {
    now: () => new Date(),
    createId: () => crypto.randomUUID(),
  });

  try {
    return await repository.load(projectId);
  } catch (error) {
    if (
      error instanceof ZodError ||
      (error as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      notFound();
    }
    throw error;
  }
}

async function loadProgress(projectId: string) {
  const config = readAppConfig(process.env);
  const repository = new FileProjectRepository(config.projectRoot, {
    now: () => new Date(),
    createId: () => crypto.randomUUID(),
  });
  return getProjectProgress(repository, projectId);
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const project = await loadProject(projectId);
  const progress = await loadProgress(project.id);

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-16">
      <ProjectJourney
        current="overview"
        projectId={project.id}
        projectTitle={project.title}
        statuses={progress}
      />
      <h1 className="mt-4 text-5xl font-semibold tracking-tight text-stone-950">
        {project.title}
      </h1>
      <section
        className="mt-10 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm"
        aria-label="Project details"
      >
        <h2 className="text-lg font-semibold text-stone-950">Project saved</h2>
        <p className="mt-2 text-stone-700">{progress.nextAction.reason}</p>
        <p className="mt-5 font-mono text-sm text-stone-600">
          Project ID: {project.id}
        </p>
        <Link
          className="mt-5 inline-block rounded-xl bg-stone-950 px-5 py-3 font-semibold text-white"
          href={progress.nextAction.href}
        >
          {progress.nextAction.label}
        </Link>
      </section>
    </main>
  );
}
