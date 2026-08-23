import { notFound } from "next/navigation";

import { PendingForm } from "@/components/pending-form";
import { ProjectJourney } from "@/components/project-journey";
import { readAppConfig } from "@/lib/config/app-config";
import { FileProjectRepository } from "@/lib/projects/file-project-repository";
import { getProjectProgress } from "@/lib/projects/project-progress";
import { projectBriefSchema } from "@/lib/projects/project";

export const runtime = "nodejs";

export default async function IdeaPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ generation?: string }>;
}) {
  const { projectId } = await params;
  const { generation } = await searchParams;
  const config = readAppConfig(process.env);
  const repository = new FileProjectRepository(config.projectRoot, {
    now: () => new Date(),
    createId: () => crypto.randomUUID(),
  });
  let savedBrief = null;
  let project;
  try {
    project = await repository.load(projectId);
    savedBrief = await repository
      .readArtifact(projectId, "brief.json", projectBriefSchema)
      .catch(() => null);
  } catch {
    notFound();
  }
  const progress = await getProjectProgress(repository, projectId);
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <ProjectJourney
        current="idea"
        projectId={projectId}
        projectTitle={project.title}
        statuses={progress}
      />
      <h1 className="mt-4 text-4xl font-semibold text-stone-950">
        What should this story keep?
      </h1>
      <p className="mt-4 text-stone-700">
        Shape the draft with as much or as little detail as you have. Only the
        original idea is required, and every detail you add will be saved before
        three directions are generated for your review.
      </p>
      {generation === "failed" ? (
        <p
          className="mt-4 rounded-xl bg-amber-50 p-4 text-amber-900"
          role="alert"
        >
          Your idea was saved locally. We could not generate directions yet;
          please try again.
        </p>
      ) : null}
      <PendingForm
        action={`/api/projects/${projectId}/directions`}
        className="mt-8 space-y-5 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm"
        pendingLabel="Generating three directions…"
        pendingMessage="Your idea is saved. We are drafting three distinct directions for you to review; you can safely return to the project overview if this request is interrupted."
        submitClassName="rounded-xl bg-stone-950 px-5 py-3 font-semibold text-white"
        submitLabel={
          savedBrief ? "Retry three directions" : "Generate three directions"
        }
      >
        <fieldset className="rounded-2xl border border-stone-200 p-4">
          <legend className="px-1 font-semibold">Reader details</legend>
          <p className="mt-1 text-sm text-stone-600">
            Age tunes story complexity. Reading mode separately tunes oral flow,
            decoding support, vocabulary, and text density.
          </p>
          <label className="mt-4 block font-semibold" htmlFor="readerAge">
            Intended reader age
            <select
              className="mt-2 block w-full rounded-xl border p-3"
              id="readerAge"
              name="readerAge"
              required
              defaultValue={savedBrief?.readerConfiguration?.age ?? 8}
            >
              {[3, 4, 5, 6, 7, 8, 9, 10].map((age) => (
                <option key={age} value={age}>
                  {age} — tuning profile preview
                </option>
              ))}
            </select>
          </label>
          <label className="mt-4 block font-semibold" htmlFor="readingMode">
            How will the child read this book?
            <select
              className="mt-2 block w-full rounded-xl border p-3"
              id="readingMode"
              name="readingMode"
              required
              defaultValue={
                savedBrief?.readerConfiguration?.readingMode ??
                "parent_read_aloud"
              }
            >
              <option value="parent_read_aloud">
                With an adult reading aloud
              </option>
              <option value="co_read">Reading together</option>
              <option value="independent_developing">
                Developing independent reader
              </option>
              <option value="independent_confident">
                Confident independent reader
              </option>
            </select>
          </label>
          {!savedBrief?.readerConfiguration && savedBrief ? (
            <p
              className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900"
              role="status"
            >
              This older project used the legacy ages 7–10 read-aloud
              assumption. Confirm or change these reader details before
              generating again.
            </p>
          ) : null}
          <p className="mt-3 text-sm text-stone-600">
            These profiles tune generation and review criteria, but they do not
            guarantee comprehension, enjoyment, or reading level.
          </p>
        </fieldset>
        <label className="block font-semibold" htmlFor="template">
          Story starting point
          <select
            className="mt-2 block w-full rounded-xl border p-3"
            id="template"
            name="template"
            defaultValue={savedBrief?.template ?? "start_from_scratch"}
          >
            <option value="mystery_and_reveal">
              Something strange is happening
            </option>
            <option value="mission_with_obstacles">
              A mission with obstacles
            </option>
            <option value="try_fail_change_plan">
              Try, fail, change the plan
            </option>
            <option value="two_sides_to_understand">
              Two sides to understand
            </option>
            <option value="feeling_changes_shape">
              A feeling changes shape
            </option>
            <option value="help_me_choose">Help me choose</option>
            <option value="start_from_scratch">Start from scratch</option>
          </select>
        </label>
        <label className="block font-semibold" htmlFor="originalIdea">
          Original idea
          <textarea
            className="mt-2 block w-full rounded-xl border p-3"
            id="originalIdea"
            name="originalIdea"
            minLength={10}
            required
            defaultValue={savedBrief?.originalIdea}
          />
        </label>
        <label className="block font-semibold" htmlFor="protagonist">
          Who should the story follow?
          <input
            className="mt-2 block w-full rounded-xl border p-3"
            id="protagonist"
            name="protagonist"
            defaultValue={savedBrief?.protagonist}
          />
        </label>
        <label className="block font-semibold" htmlFor="characterDesire">
          What do they care about right now?
          <input
            className="mt-2 block w-full rounded-xl border p-3"
            id="characterDesire"
            name="characterDesire"
            defaultValue={savedBrief?.characterDesire}
          />
        </label>
        <label className="block font-semibold" htmlFor="desiredFeeling">
          What should this feel like?
          <input
            className="mt-2 block w-full rounded-xl border p-3"
            id="desiredFeeling"
            name="desiredFeeling"
            defaultValue={savedBrief?.desiredFeeling}
          />
        </label>
        <label className="block font-semibold" htmlFor="mustKeep">
          Must keep
          <textarea
            className="mt-2 block w-full rounded-xl border p-3"
            id="mustKeep"
            name="mustKeep"
            defaultValue={savedBrief?.mustKeep}
          />
        </label>
        <label className="block font-semibold" htmlFor="valueOrQuestion">
          Optional value or question
          <input
            className="mt-2 block w-full rounded-xl border p-3"
            id="valueOrQuestion"
            name="valueOrQuestion"
            defaultValue={savedBrief?.valueOrQuestion}
          />
        </label>
        <label className="block font-semibold" htmlFor="avoid">
          Anything to avoid?
          <input
            className="mt-2 block w-full rounded-xl border p-3"
            id="avoid"
            name="avoid"
            defaultValue={savedBrief?.avoid}
          />
        </label>
        <p className="text-sm text-stone-600">
          Creates: three text-only story directions. Uses: your idea and every
          detail above. These are AI drafts for your review. A text cost
          estimate is not available yet; no image cost is incurred at this step.
        </p>
      </PendingForm>
    </main>
  );
}
