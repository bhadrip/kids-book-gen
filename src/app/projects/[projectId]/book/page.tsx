import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PendingForm } from "@/components/pending-form";
import { ProjectJourney } from "@/components/project-journey";
import { readAppConfig } from "@/lib/config/app-config";
import { FileProjectRepository } from "@/lib/projects/file-project-repository";
import { getProjectProgress } from "@/lib/projects/project-progress";
import { projectBriefSchema } from "@/lib/projects/project";
import {
  labelForPage,
  requiredBookPageIds,
} from "@/lib/production/book-preflight";
import { createBookProduction } from "@/lib/production/create-book-production";
import {
  bookPageIdSchema,
  bookPageSchema,
  bookPreflightSchema,
  bookProductionJobSchema,
} from "@/lib/production/production-artifacts";
import {
  sampleSpreadSchema,
  visualDecisionSchema,
} from "@/lib/visuals/visual-artifacts";

export const runtime = "nodejs";

async function optional<T>(operation: Promise<T>): Promise<T | null> {
  return operation.catch(() => null);
}

async function loadBook(projectId: string) {
  const config = readAppConfig(process.env);
  const repository = new FileProjectRepository(config.projectRoot, {
    now: () => new Date(),
    createId: () => crypto.randomUUID(),
  });
  try {
    const [
      project,
      brief,
      sample,
      visualDecision,
      job,
      preflight,
      pages,
      progress,
      estimate,
    ] = await Promise.all([
      repository.load(projectId),
      optional(
        repository.readArtifact(projectId, "brief.json", projectBriefSchema),
      ),
      optional(
        repository.readArtifact(
          projectId,
          "sample-spread.json",
          sampleSpreadSchema,
        ),
      ),
      optional(
        repository.readArtifact(
          projectId,
          "visual-decision.json",
          visualDecisionSchema,
        ),
      ),
      optional(
        repository.readArtifact(
          projectId,
          "book-production-job.json",
          bookProductionJobSchema,
        ),
      ),
      optional(
        repository.readArtifact(
          projectId,
          "book-preflight.json",
          bookPreflightSchema,
        ),
      ),
      Promise.all(
        requiredBookPageIds.map((pageId) =>
          optional(
            repository.readArtifact(
              projectId,
              `book-page-${pageId}.json`,
              bookPageSchema,
            ),
          ),
        ),
      ),
      getProjectProgress(repository, projectId),
      optional(
        (await createBookProduction(config, () => new Date())).estimate(
          projectId,
        ),
      ),
    ]);
    return {
      project,
      brief,
      sample,
      visualDecision,
      job,
      preflight,
      pages: pages.filter((page) => page !== null),
      progress,
      estimate,
      nextRegenerationEstimate:
        (job?.estimatedSpentCostUsd ?? 0) + config.finalImageEstimateUsd,
    };
  } catch {
    notFound();
  }
}

const assetUrl = (projectId: string, filename: string) =>
  `/api/projects/${projectId}/assets/${filename}`;

export default async function BookPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ result?: string; page?: string }>;
}) {
  const { projectId } = await params;
  const { result, page: resultPage } = await searchParams;
  const data = await loadBook(projectId);
  const visualApproved =
    data.sample &&
    data.visualDecision?.status === "approved" &&
    data.visualDecision.sampleRevision === data.sample.revision;
  const completed = data.job?.completedUnitIds.length ?? data.pages.length;
  const generating = data.job?.status === "in_progress";
  const canResume =
    visualApproved &&
    data.job?.status !== "completed" &&
    data.job?.status !== "in_progress" &&
    data.pages.length < requiredBookPageIds.length;
  const parsedResultPage = bookPageIdSchema.safeParse(resultPage);

  return (
    <main className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
      <ProjectJourney
        current="book"
        projectId={projectId}
        projectTitle={data.project.title}
        statuses={data.progress}
      />
      <div className="mt-10 flex flex-col gap-4 border-b border-stone-200 pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-[0.18em] text-sky-800 uppercase">
            Full-book production
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
            Make the complete book, one saved page at a time.
          </h1>
        </div>
        <p className="max-w-md text-sm leading-6 text-stone-600">
          The app makes 16 landscape pages in sequence. Each illustration is a
          draft for your review, with editable text kept outside the artwork.
        </p>
      </div>

      {data.brief ? (
        <aside className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-950">
          <p className="text-xs font-semibold tracking-[0.14em] uppercase">
            Family details every page must preserve
          </p>
          <p className="mt-2">
            {data.brief.mustKeep ??
              "No additional must-keep details were supplied."}
          </p>
        </aside>
      ) : null}

      {result === "saved" ? (
        <p
          className="mt-6 rounded-2xl bg-green-50 p-5 text-green-900"
          role="status"
        >
          Book production is saved. Review each page and its separate text layer
          below.
        </p>
      ) : null}
      {result === "paused" ? (
        <p
          className="mt-6 rounded-2xl bg-amber-50 p-5 text-amber-950"
          role="status"
        >
          Production will pause before the next page. Every completed page is
          safely saved.
        </p>
      ) : null}
      {result === "failed" || data.job?.status === "failed" ? (
        <p className="mt-6 rounded-2xl bg-red-50 p-5 text-red-900" role="alert">
          {data.job?.failureMessage ??
            "That page did not finish. The current page and every completed sibling are still saved."}
        </p>
      ) : null}
      {result === "keep" ? (
        <p
          className="mt-6 rounded-2xl bg-green-50 p-5 text-green-900"
          role="status"
        >
          {parsedResultPage.success
            ? labelForPage(parsedResultPage.data)
            : "The page"}{" "}
          is marked to keep in this book.
        </p>
      ) : null}
      {result === "edit_text" ? (
        <p
          className="mt-6 rounded-2xl bg-green-50 p-5 text-green-900"
          role="status"
        >
          The separate text layer is saved as a new page revision. Its
          illustration and sibling pages were preserved.
        </p>
      ) : null}
      {result === "regenerate" ? (
        <p
          className="mt-6 rounded-2xl bg-green-50 p-5 text-green-900"
          role="status"
        >
          The selected page has a new illustration revision. Every sibling page
          remains unchanged.
        </p>
      ) : null}

      {!visualApproved ? (
        <section className="mt-10 rounded-3xl border border-stone-200 bg-white p-7 shadow-sm">
          <p className="text-sm font-semibold text-sky-800">
            Approve the look first
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-stone-950">
            Full-book artwork stays locked until the current sample is approved.
          </h2>
          <p className="mt-3 max-w-2xl leading-7 text-stone-700">
            This prevents a costly sequence from using an unapproved character
            or layout. Your story and visual drafts remain saved.
          </p>
          <Link
            className="mt-5 inline-block rounded-xl bg-stone-950 px-5 py-3 font-semibold text-white"
            href={`/projects/${projectId}/look`}
          >
            Review the visual sample
          </Link>
        </section>
      ) : null}

      {visualApproved && data.estimate ? (
        <section className="mt-10 grid gap-6 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-semibold text-sky-800">
              Before generating
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-950">
              {data.estimate.remainingUnits === 0
                ? "All required pages are saved"
                : `${data.estimate.remainingUnits} pages remain in this sequential job`}
            </h2>
            <p className="mt-3 max-w-3xl leading-7 text-stone-700">
              The job uses the approved character reference, Visual Bible, story
              beat, family details, and prior saved page for continuity. A
              successful page is saved atomically before the next request.
            </p>
            <dl className="mt-5 grid gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-sm text-stone-500">Safely saved</dt>
                <dd className="mt-1 text-xl font-semibold text-stone-950">
                  {data.estimate.completedUnits} of 16
                </dd>
              </div>
              <div>
                <dt className="text-sm text-stone-500">Tracked estimate</dt>
                <dd className="mt-1 text-xl font-semibold text-stone-950">
                  ${data.estimate.estimatedTotalCostUsd.toFixed(2)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-stone-500">Soft budget</dt>
                <dd className="mt-1 text-xl font-semibold text-stone-950">
                  ${data.estimate.softBudgetUsd.toFixed(2)}
                </dd>
              </div>
            </dl>
            {data.estimate.estimatedTotalCostUsd >
            data.estimate.softBudgetUsd ? (
              <p className="mt-5 rounded-xl bg-amber-50 p-4 text-amber-950">
                This estimate is above the $
                {data.estimate.softBudgetUsd.toFixed(2)}
                soft budget. Completed pages remain usable if you pause.
              </p>
            ) : null}
            <p className="mt-4 text-sm leading-6 text-stone-600">
              This is a configurable estimate, not a provider invoice. Failed or
              provider-adjusted requests may differ; no paid request runs in
              automated tests.
            </p>
          </div>

          {canResume ? (
            <PendingForm
              action={`/api/projects/${projectId}/book/production`}
              pendingLabel={
                data.pages.length === 0
                  ? "Making the book…"
                  : "Resuming the book…"
              }
              pendingMessage={`${completed} of 16 pages were safely saved before this request. New pages are saved one at a time; you may save and exit while the local job continues.`}
              submitClassName="rounded-xl bg-stone-950 px-5 py-3 font-semibold text-white"
              submitLabel={
                data.job?.status === "failed"
                  ? "Retry the failed page"
                  : data.pages.length > 0
                    ? "Resume with the next page"
                    : "Start full-book production"
              }
            >
              <input name="action" type="hidden" value="start" />
              {data.estimate.requiresOverFiveConfirmation ? (
                <label className="mb-4 flex max-w-sm items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
                  <input
                    className="mt-1"
                    name="confirmOverFive"
                    required
                    type="checkbox"
                  />
                  <span>
                    I confirm this action may bring the tracked estimate above
                    $5.00.
                  </span>
                </label>
              ) : null}
            </PendingForm>
          ) : generating ? (
            <div className="max-w-sm space-y-5">
              <PendingForm
                action={`/api/projects/${projectId}/book/production`}
                pendingLabel="Requesting a safe pause…"
                pendingMessage="The current provider request may finish first; no new page will start after the pause is saved."
                submitClassName="rounded-xl border border-stone-950 px-5 py-3 font-semibold text-stone-950"
                submitLabel="Stop after the current page"
              >
                <input name="action" type="hidden" value="pause" />
              </PendingForm>
              <div className="border-t border-stone-200 pt-5">
                <p className="text-sm leading-6 text-stone-600">
                  If the app or computer restarted and no browser still shows an
                  active “Making the book” request, resume from the first
                  missing page.
                </p>
                <PendingForm
                  action={`/api/projects/${projectId}/book/production`}
                  className="mt-3"
                  pendingLabel="Resuming after interruption…"
                  pendingMessage={`${completed} of 16 pages are already safe. Production is resuming from the first missing page.`}
                  submitClassName="rounded-xl bg-stone-950 px-5 py-3 font-semibold text-white"
                  submitLabel="Resume after an app restart"
                >
                  <input name="action" type="hidden" value="start" />
                  {data.estimate.requiresOverFiveConfirmation ? (
                    <label className="mb-4 flex items-start gap-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-950">
                      <input
                        className="mt-1"
                        name="confirmOverFive"
                        required
                        type="checkbox"
                      />
                      <span>
                        I confirm this resumed action may bring the tracked
                        estimate above $5.00.
                      </span>
                    </label>
                  ) : null}
                </PendingForm>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {data.job ? (
        <section
          className="mt-8 rounded-3xl border border-stone-200 bg-stone-950 p-6 text-white"
          aria-labelledby="production-progress-heading"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-amber-300">
                Persisted job
              </p>
              <h2
                className="mt-1 text-2xl font-semibold"
                id="production-progress-heading"
              >
                {data.job.stage}
              </h2>
            </div>
            <p className="font-semibold">{completed} of 16 pages saved</p>
          </div>
          <progress
            className="mt-5 h-3 w-full accent-amber-400"
            max={16}
            value={completed}
          >
            {completed} of 16
          </progress>
          <p className="mt-3 text-sm text-stone-300">
            Last safe result: {data.job.lastSavedArtifact}. Updated{" "}
            {new Date(data.job.updatedAt).toLocaleString("en-US")}.
          </p>
        </section>
      ) : null}

      {data.preflight ? (
        <section
          className={`mt-8 rounded-3xl border p-6 ${data.preflight.status === "passed" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
          aria-labelledby="preflight-heading"
        >
          <h2
            className="text-2xl font-semibold text-stone-950"
            id="preflight-heading"
          >
            {data.preflight.status === "passed"
              ? "Production preflight passed"
              : "Production preflight needs attention"}
          </h2>
          <p className="mt-2 text-stone-700">
            {data.preflight.status === "passed"
              ? "All required pages have non-empty text, the approved character reference, and beat-specific continuity facts."
              : "Resume or repair only the listed pages; completed siblings remain safe."}
          </p>
          {data.preflight.issues.length > 0 ? (
            <ul className="mt-4 list-disc space-y-2 pl-6 text-red-900">
              {data.preflight.issues.map((issue) => (
                <li key={`${issue.pageId}-${issue.code}`}>{issue.message}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      {data.pages.length > 0 ? (
        <section className="mt-12" aria-labelledby="saved-pages-heading">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-sky-800">Saved work</p>
              <h2
                className="mt-2 text-3xl font-semibold text-stone-950"
                id="saved-pages-heading"
              >
                Review page by page
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-stone-600">
              Keep a page, edit only its HTML text, or regenerate only its image
              with explicit change and preserve instructions.
            </p>
          </div>
          <div className="mt-7 grid gap-8 xl:grid-cols-2">
            {data.pages.map((bookPage) => (
              <article
                className="scroll-mt-6 overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm"
                id={bookPage.pageId}
                key={bookPage.pageId}
              >
                <div className="relative aspect-[3/2] min-h-80 bg-stone-200">
                  <Image
                    alt={bookPage.altText}
                    className="object-cover"
                    fill
                    loading={bookPage.sequence === 1 ? "eager" : "lazy"}
                    sizes="(min-width: 1280px) 50vw, 100vw"
                    src={assetUrl(projectId, bookPage.assetFilename)}
                    unoptimized
                  />
                  <div className="absolute top-[7%] left-[5%] max-h-[62%] w-[42%] overflow-auto rounded-2xl bg-[#fffdf7]/94 p-4 shadow-lg backdrop-blur-sm">
                    <p className="text-xs font-semibold tracking-wide text-sky-800 uppercase">
                      {bookPage.title}
                    </p>
                    <p
                      className="mt-2 text-sm leading-6 whitespace-pre-line text-stone-950"
                      data-testid={`book-text-${bookPage.pageId}`}
                    >
                      {bookPage.text}
                    </p>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-stone-950">
                        {bookPage.title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-stone-600">
                        {bookPage.beat}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
                      Revision {bookPage.revision} ·{" "}
                      {bookPage.status === "kept" ? "Keep" : "Draft"}
                    </span>
                  </div>

                  <PendingForm
                    action={`/api/projects/${projectId}/book/pages/${bookPage.pageId}`}
                    className="mt-5"
                    pendingLabel="Saving keep decision…"
                    pendingMessage="This exact page revision is being marked to keep. No sibling page changes."
                    submitClassName="rounded-xl bg-stone-950 px-5 py-3 font-semibold text-white"
                    submitLabel={
                      bookPage.status === "kept"
                        ? "Keep decision saved"
                        : "Keep this page"
                    }
                  >
                    <input name="action" type="hidden" value="keep" />
                  </PendingForm>

                  <details className="mt-5 border-t border-stone-200 pt-5">
                    <summary className="cursor-pointer font-semibold text-stone-950">
                      Edit the separate text layer
                    </summary>
                    <PendingForm
                      action={`/api/projects/${projectId}/book/pages/${bookPage.pageId}`}
                      className="mt-4"
                      pendingLabel="Saving page text…"
                      pendingMessage="The illustration and all sibling pages remain unchanged while this text revision is saved."
                      submitClassName="mt-3 rounded-xl border border-stone-950 px-5 py-3 font-semibold text-stone-950"
                      submitLabel="Save page text"
                    >
                      <input name="action" type="hidden" value="edit_text" />
                      <label
                        className="block font-semibold text-stone-950"
                        htmlFor={`text-${bookPage.pageId}`}
                      >
                        Page text
                      </label>
                      <textarea
                        className="mt-2 block min-h-32 w-full rounded-xl border border-stone-300 p-3 leading-7 outline-none focus:border-sky-800 focus:ring-2 focus:ring-sky-100"
                        defaultValue={bookPage.text}
                        id={`text-${bookPage.pageId}`}
                        maxLength={3000}
                        name="text"
                        required
                      />
                    </PendingForm>
                  </details>

                  <details className="mt-5 border-t border-stone-200 pt-5">
                    <summary className="cursor-pointer font-semibold text-stone-950">
                      Regenerate only this image
                    </summary>
                    <PendingForm
                      action={`/api/projects/${projectId}/book/pages/${bookPage.pageId}`}
                      className="mt-4"
                      pendingLabel="Regenerating only this page…"
                      pendingMessage="The current page, its editable text, and all sibling pages remain saved while a numbered image successor is created."
                      submitClassName="mt-4 rounded-xl border border-stone-950 px-5 py-3 font-semibold text-stone-950"
                      submitLabel="Regenerate this page image"
                    >
                      <input name="action" type="hidden" value="regenerate" />
                      <label
                        className="block font-semibold text-stone-950"
                        htmlFor={`feedback-${bookPage.pageId}`}
                      >
                        What should change?
                      </label>
                      <textarea
                        className="mt-2 block min-h-24 w-full rounded-xl border border-stone-300 p-3"
                        id={`feedback-${bookPage.pageId}`}
                        maxLength={1000}
                        name="feedback"
                        required
                      />
                      <label
                        className="mt-4 block font-semibold text-stone-950"
                        htmlFor={`preserve-${bookPage.pageId}`}
                      >
                        What must stay exactly the same?
                      </label>
                      <textarea
                        className="mt-2 block min-h-24 w-full rounded-xl border border-stone-300 p-3"
                        id={`preserve-${bookPage.pageId}`}
                        maxLength={1000}
                        name="preserve"
                        required
                      />
                      {data.nextRegenerationEstimate > 5 ? (
                        <label className="mt-4 flex items-start gap-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-950">
                          <input
                            className="mt-1"
                            name="confirmOverFive"
                            required
                            type="checkbox"
                          />
                          <span>
                            I confirm this regeneration may bring the tracked
                            estimate to $
                            {data.nextRegenerationEstimate.toFixed(2)}, above
                            $5.00.
                          </span>
                        </label>
                      ) : null}
                    </PendingForm>
                  </details>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {data.job?.activity.length ? (
        <section
          className="mt-12 rounded-3xl border border-stone-200 bg-white p-6"
          aria-labelledby="activity-heading"
        >
          <h2
            className="text-2xl font-semibold text-stone-950"
            id="activity-heading"
          >
            Production activity
          </h2>
          <p className="mt-2 text-sm text-stone-600">
            A parent-readable history of saved, paused, failed, resumed, and
            revised work.
          </p>
          <ol className="mt-5 space-y-4">
            {[...data.job.activity].reverse().map((event) => (
              <li className="border-l-2 border-sky-200 pl-4" key={event.id}>
                <p className="text-sm font-semibold text-stone-950">
                  {event.message}
                </p>
                <time
                  className="mt-1 block text-xs text-stone-500"
                  dateTime={event.at}
                >
                  {new Date(event.at).toLocaleString("en-US")}
                </time>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </main>
  );
}
