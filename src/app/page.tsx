import Link from "next/link";

import { PendingForm } from "@/components/pending-form";
import { readAppConfig } from "@/lib/config/app-config";

export const runtime = "nodejs";

export default async function HomePage() {
  const config = readAppConfig(process.env);
  const generationReady =
    (config.textProvider === "fixture" || Boolean(config.openAiApiKey)) &&
    (config.imageProvider === "fixture" || Boolean(config.openAiApiKey));
  const { FileProjectRepository } =
    await import("@/lib/projects/file-project-repository");
  const repository = new FileProjectRepository(config.projectRoot, {
    now: () => new Date(),
    createId: () => crypto.randomUUID(),
  });
  const projects = await repository.list();

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-16">
      <p className="text-sm font-semibold tracking-[0.18em] text-amber-800 uppercase">
        Storytime Studio
      </p>
      <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-tight text-stone-950">
        A family idea, made into a real storybook.
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-700">
        Start locally, shape an original idea, compare story directions, and
        approve a saved text manuscript before moving into visual creation.
      </p>
      <PendingForm
        action="/api/projects"
        className="mt-10 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm"
        pendingLabel="Creating local project…"
        pendingMessage="Saving a private project folder on this computer."
        submitClassName="mt-5 rounded-xl bg-stone-950 px-5 py-3 font-semibold text-white"
        submitLabel="Create local project"
      >
        <h2 className="text-lg font-semibold text-stone-950">
          Start a local project
        </h2>
        <p className="mt-2 text-stone-700">
          Give this family story a working title. You can shape the idea next.
        </p>
        <label
          className="mt-5 block text-sm font-semibold text-stone-800"
          htmlFor="project-title"
        >
          Project title
        </label>
        <input
          className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-950 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-200"
          id="project-title"
          name="title"
          placeholder="e.g. Milo and the Moon Kite"
          required
        />
      </PendingForm>
      <section
        className="mt-10 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm"
        aria-label="Saved projects"
      >
        <h2 className="text-lg font-semibold text-stone-950">Your projects</h2>
        {projects.length === 0 ? (
          <p className="mt-2 text-stone-700">
            No saved projects yet. Start one above when you are ready.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {projects.map((project) => (
              <li key={project.id}>
                <Link
                  className="block rounded-xl border border-stone-200 px-4 py-3 font-semibold text-stone-950 transition hover:border-amber-700 hover:bg-amber-50"
                  href={`/projects/${project.id}`}
                >
                  {project.title}
                  <span className="mt-1 block font-mono text-xs font-normal text-stone-500">
                    Saved locally
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section
        className="mt-10 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm"
        aria-label="Local setup status"
      >
        <h2 className="text-lg font-semibold text-stone-950">
          Local generation
        </h2>
        <p className="mt-2 text-stone-700">
          {generationReady
            ? config.textProvider === "fixture" &&
              config.imageProvider === "fixture"
              ? "Ready to use local fixture generation."
              : `Ready to use ${config.textModel} and ${config.imageModel}.`
            : "Add OPENAI_API_KEY to .env.local before generating a story."}
        </p>
      </section>
    </main>
  );
}
