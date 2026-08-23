import Link from "next/link";

import { BookReader } from "@/components/book-reader";
import { ReaderConfigurationSummary } from "@/components/reader-configuration-summary";
import { PdfDownloadButton } from "@/components/pdf-download-button";
import { PendingForm } from "@/components/pending-form";
import { readAppConfig } from "@/lib/config/app-config";
import { FileProjectRepository } from "@/lib/projects/file-project-repository";
import { projectBriefSchema } from "@/lib/projects/project";
import { createBookProof } from "@/lib/proof/create-book-proof";

export const runtime = "nodejs";

async function optional<T>(operation: Promise<T>): Promise<T | null> {
  return operation.catch(() => null);
}

async function loadReader(projectId: string) {
  const config = readAppConfig(process.env);
  const repository = new FileProjectRepository(config.projectRoot, {
    now: () => new Date(),
    createId: () => crypto.randomUUID(),
  });
  const project = await repository.load(projectId);
  const brief = await optional(
    repository.readArtifact(projectId, "brief.json", projectBriefSchema),
  );
  try {
    return {
      project,
      brief,
      reader: await createBookProof(config, () => new Date()).prepareReader(
        projectId,
      ),
      error: null,
    };
  } catch (error) {
    return {
      project,
      brief,
      reader: null,
      error:
        error instanceof Error
          ? error.message
          : "The reader is not ready yet. Review the saved book first.",
    };
  }
}

function interestLabel(value: "yes" | "maybe" | "no") {
  if (value === "yes") return "Yes";
  if (value === "maybe") return "Maybe";
  return "Not this time";
}

export default async function ReaderPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ result?: string }>;
}) {
  const { projectId } = await params;
  const { result } = await searchParams;
  const data = await loadReader(projectId);

  if (!data.reader) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
        <p className="text-sm font-semibold text-amber-800">
          {data.project.title}
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-stone-950">
          The family reader is not ready yet.
        </h1>
        <p
          className="mt-5 rounded-2xl bg-amber-50 p-5 text-amber-950"
          role="alert"
        >
          {data.error} Your saved pages were not changed.
        </p>
        <Link
          className="mt-6 inline-block rounded-xl bg-stone-950 px-5 py-3 font-semibold text-white"
          href={`/projects/${projectId}/book`}
        >
          Return to book review
        </Link>
      </main>
    );
  }

  const { feedback, pages, proof, summary } = data.reader;
  return (
    <main>
      <BookReader
        pages={pages}
        projectId={projectId}
        projectTitle={data.project.title}
      />

      <section className="mx-auto max-w-4xl px-6 py-14" id="reading-feedback">
        <p className="text-sm font-semibold tracking-[0.15em] text-sky-800 uppercase">
          Saved family proof
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-stone-950">
          Download this exact approved book.
        </h2>
        <p className="mt-3 max-w-2xl leading-7 text-stone-700">
          Proof revision {proof.revision} contains all 16 approved pages. The
          same spread layout above is checked for clipped text before the local
          screen-quality PDF is saved and downloaded.
        </p>
        <div className="mt-6">
          <PdfDownloadButton projectId={projectId} />
        </div>
      </section>

      <section className="border-y border-stone-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-14">
          <p className="text-sm font-semibold tracking-[0.15em] text-sky-800 uppercase">
            Optional local reading reflection
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-stone-950">
            What happened when you read together?
          </h2>
          <p className="mt-3 max-w-3xl leading-7 text-stone-700">
            This feedback is saved only in this local project. It does not
            change this book, train a model, or promise different future
            generations.
          </p>
          {data.brief ? (
            <>
              <ReaderConfigurationSummary
                reader={data.brief.readerConfiguration}
              />
              <aside className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
                <p className="text-xs font-semibold tracking-wide uppercase">
                  Original must-keep details
                </p>
                <p className="mt-2">
                  {data.brief.mustKeep ??
                    "No additional must-keep details were supplied."}
                </p>
              </aside>
            </>
          ) : null}
          {result === "feedback_saved" ? (
            <p
              className="mt-6 rounded-2xl bg-green-50 p-5 text-green-900"
              role="status"
            >
              Reading feedback saved locally. The book and its approved pages
              were not changed.
            </p>
          ) : null}

          <PendingForm
            action={`/api/projects/${projectId}/book/feedback`}
            className="mt-8 space-y-6"
            pendingLabel="Saving reading feedback…"
            pendingMessage="The reflection is being saved locally. The approved proof remains unchanged."
            submitClassName="rounded-xl bg-stone-950 px-5 py-3 font-semibold text-white"
            submitLabel={
              feedback ? "Save updated feedback" : "Save reading feedback"
            }
          >
            <div>
              <label
                className="block font-semibold text-stone-950"
                htmlFor="favorite-part"
              >
                Favorite part
              </label>
              <textarea
                className="mt-2 block min-h-28 w-full rounded-xl border border-stone-300 p-3"
                defaultValue={feedback?.favoritePart}
                id="favorite-part"
                maxLength={1000}
                name="favoritePart"
                required
              />
            </div>
            <div>
              <label
                className="block font-semibold text-stone-950"
                htmlFor="confusion"
              >
                Was anything confusing? (optional)
              </label>
              <textarea
                className="mt-2 block min-h-24 w-full rounded-xl border border-stone-300 p-3"
                defaultValue={feedback?.confusion}
                id="confusion"
                maxLength={1000}
                name="confusion"
              />
            </div>
            <fieldset>
              <legend className="font-semibold text-stone-950">
                Did you finish the book?
              </legend>
              <div className="mt-3 flex flex-wrap gap-5">
                <label className="flex items-center gap-2">
                  <input
                    defaultChecked={feedback?.completion !== "stopped_early"}
                    name="completion"
                    type="radio"
                    value="finished"
                  />
                  Yes, we finished
                </label>
                <label className="flex items-center gap-2">
                  <input
                    defaultChecked={feedback?.completion === "stopped_early"}
                    name="completion"
                    type="radio"
                    value="stopped_early"
                  />
                  We stopped early
                </label>
              </div>
            </fieldset>
            <div>
              <label
                className="block font-semibold text-stone-950"
                htmlFor="idea-fidelity"
              >
                How much did the book feel like your original idea? (1–5)
              </label>
              <select
                className="mt-2 min-h-11 rounded-xl border border-stone-300 px-3"
                defaultValue={feedback?.ideaFidelityRating ?? 5}
                id="idea-fidelity"
                name="ideaFidelityRating"
              >
                {[1, 2, 3, 4, 5].map((rating) => (
                  <option key={rating} value={rating}>
                    {rating}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="font-semibold text-stone-950">
                Reread interest
                <select
                  className="mt-2 block min-h-11 w-full rounded-xl border border-stone-300 px-3 font-normal"
                  defaultValue={feedback?.rereadInterest ?? "maybe"}
                  name="rereadInterest"
                >
                  <option value="yes">Yes</option>
                  <option value="maybe">Maybe</option>
                  <option value="no">Not this time</option>
                </select>
              </label>
              <label className="font-semibold text-stone-950">
                Interest in another story or sequel
                <select
                  className="mt-2 block min-h-11 w-full rounded-xl border border-stone-300 px-3 font-normal"
                  defaultValue={feedback?.sequelInterest ?? "maybe"}
                  name="sequelInterest"
                >
                  <option value="yes">Yes</option>
                  <option value="maybe">Maybe</option>
                  <option value="no">Not this time</option>
                </select>
              </label>
            </div>
          </PendingForm>
        </div>
      </section>

      {summary ? (
        <section
          className="mx-auto max-w-4xl px-6 py-14"
          aria-labelledby="pilot-summary-heading"
        >
          <p className="text-sm font-semibold tracking-[0.15em] text-sky-800 uppercase">
            Local pilot summary
          </p>
          <h2
            className="mt-2 text-3xl font-semibold text-stone-950"
            id="pilot-summary-heading"
          >
            One clear record for this family session
          </h2>
          <dl className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl bg-white p-5">
              <dt className="text-sm text-stone-600">
                Project start to feedback
              </dt>
              <dd className="mt-1 text-2xl font-semibold">
                {summary.minutesFromProjectStartToFeedback} min
              </dd>
            </div>
            <div className="rounded-2xl bg-white p-5">
              <dt className="text-sm text-stone-600">
                Final-page regenerations
              </dt>
              <dd className="mt-1 text-2xl font-semibold">
                {summary.finalPageRegenerationCount}
              </dd>
            </div>
            <div className="rounded-2xl bg-white p-5">
              <dt className="text-sm text-stone-600">Tracked image estimate</dt>
              <dd className="mt-1 text-2xl font-semibold">
                ${summary.estimatedBookCostUsd.toFixed(2)}
              </dd>
            </div>
            <div className="rounded-2xl bg-white p-5">
              <dt className="text-sm text-stone-600">Idea fidelity</dt>
              <dd className="mt-1 text-2xl font-semibold">
                {summary.ideaFidelityRating}/5
              </dd>
            </div>
            <div className="rounded-2xl bg-white p-5">
              <dt className="text-sm text-stone-600">Reading completion</dt>
              <dd className="mt-1 text-2xl font-semibold">
                {summary.readingCompleted ? "Finished" : "Stopped early"}
              </dd>
            </div>
            <div className="rounded-2xl bg-white p-5">
              <dt className="text-sm text-stone-600">Reread</dt>
              <dd className="mt-1 text-2xl font-semibold">
                {interestLabel(summary.rereadInterest)}
              </dd>
            </div>
            <div className="rounded-2xl bg-white p-5">
              <dt className="text-sm text-stone-600">
                Sequel or another story
              </dt>
              <dd className="mt-1 text-2xl font-semibold">
                {interestLabel(summary.sequelInterest)}
              </dd>
            </div>
          </dl>
        </section>
      ) : null}
    </main>
  );
}
