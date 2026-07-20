import Link from "next/link";
import { notFound } from "next/navigation";
import { ZodError } from "zod";

import { readAppConfig } from "@/lib/config/app-config";
import { FileProjectRepository } from "@/lib/projects/file-project-repository";

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

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const project = await loadProject(projectId);

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-16">
      <p className="text-sm font-semibold tracking-[0.18em] text-amber-800 uppercase">
        Storytime Studio · Local project
      </p>
      <h1 className="mt-4 text-5xl font-semibold tracking-tight text-stone-950">
        {project.title}
      </h1>
      <section
        className="mt-10 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm"
        aria-label="Project details"
      >
        <h2 className="text-lg font-semibold text-stone-950">Project saved</h2>
        <p className="mt-2 text-stone-700">
          This local project is ready for the idea step when it arrives.
        </p>
        <p className="mt-5 font-mono text-sm text-stone-600">
          Project ID: {project.id}
        </p>
        <Link
          className="mt-5 inline-block font-semibold text-amber-800 underline underline-offset-4"
          href="/"
        >
          Back to your projects
        </Link>
      </section>
    </main>
  );
}
