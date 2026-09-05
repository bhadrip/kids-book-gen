import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PendingForm } from "@/components/pending-form";
import { ProductionLiveStatus } from "@/components/production-live-status";
import { ProjectJourney } from "@/components/project-journey";
import { ReaderConfigurationSummary } from "@/components/reader-configuration-summary";
import { readAppConfig } from "@/lib/config/app-config";
import { FileProjectRepository } from "@/lib/projects/file-project-repository";
import { getProjectProgress } from "@/lib/projects/project-progress";
import { projectBriefSchema } from "@/lib/projects/project";
import { requiredBookPageIds } from "@/lib/production/book-preflight";
import { getActiveProductionRun } from "@/lib/production/active-production-runs";
import { createBookProduction } from "@/lib/production/create-book-production";
import {
  bookPageSchema,
  bookPreflightSchema,
  bookProductionJobSchema,
  type BookPlanPage,
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
  const loadedAt = new Date();
  const config = readAppConfig(process.env);
  const repository = new FileProjectRepository(config.projectRoot, {
    now: () => new Date(),
    createId: () => crypto.randomUUID(),
  });
  try {
    const production = await createBookProduction(config, () => new Date());
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
      planPreview,
      bookApproval,
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
      optional(production.estimate(projectId)),
      optional(production.previewBookPlan(projectId)),
      optional(production.reviewBookApproval(projectId)),
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
      planPreview,
      bookApproval,
      activeProductionRun: getActiveProductionRun(projectId),
      productionRecentlyUpdated: Boolean(
        job?.status === "in_progress" &&
        loadedAt.getTime() - new Date(job.updatedAt).getTime() < 4 * 60 * 1_000,
      ),
      nextRegenerationEstimate:
        (job?.estimatedSpentCostUsd ?? 0) + config.finalImageEstimateUsd,
    };
  } catch {
    notFound();
  }
}

const assetUrl = (projectId: string, filename: string) =>
  `/api/projects/${projectId}/assets/${filename}`;

function textPosition(textSafeArea: BookPlanPage["textSafeArea"]): string {
  const positions = {
    upper_left: "top-[7%] left-[5%]",
    upper_right: "top-[7%] right-[5%]",
    lower_left: "bottom-[7%] left-[5%]",
    lower_right: "right-[5%] bottom-[7%]",
  } as const;
  return positions[textSafeArea];
}

function PlanWireframe({
  page,
  compact = false,
}: {
  page: BookPlanPage;
  compact?: boolean;
}) {
  return (
    <div
      className={`relative aspect-[3/2] overflow-hidden bg-stone-100 ${compact ? "min-h-44" : "min-h-[28rem] rounded-3xl"}`}
    >
      <div className="absolute inset-4 flex items-center justify-center rounded-2xl border-2 border-dashed border-stone-300 bg-gradient-to-br from-stone-50 to-stone-200 p-5 text-center">
        <div className="max-w-[72%]">
          <p className="text-xs font-semibold tracking-[0.14em] text-sky-800 uppercase">
            Artwork wireframe
          </p>
          <p
            className={`${compact ? "mt-2 line-clamp-4 text-xs leading-5" : "mt-4 text-base leading-7"} text-stone-600`}
          >
            {page.illustrationDescription}
          </p>
        </div>
      </div>
      <div
        className={`absolute ${textPosition(page.textSafeArea)} max-h-[58%] w-[42%] overflow-auto rounded-xl bg-[#fffdf7]/95 ${compact ? "p-2" : "p-5 shadow-lg"}`}
      >
        <p className="text-[0.6rem] font-semibold tracking-wide text-sky-800 uppercase sm:text-xs">
          {page.title}
        </p>
        <p
          className={`${compact ? "mt-1 line-clamp-4 text-[0.58rem] leading-3 sm:text-xs sm:leading-4" : "mt-3 text-base leading-7 whitespace-pre-line"} text-stone-950`}
        >
          {page.text}
        </p>
      </div>
    </div>
  );
}

export default async function BookPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ result?: string; page?: string }>;
}) {
  const { projectId } = await params;
  const { result } = await searchParams;
  const data = await loadBook(projectId);
  const visualApproved =
    data.sample &&
    data.visualDecision?.status === "approved" &&
    data.visualDecision.sampleRevision === data.sample.revision;
  const completed = data.job?.completedUnitIds.length ?? data.pages.length;
  const generating = data.job?.status === "in_progress";
  const generationActive = generating && Boolean(data.activeProductionRun);
  const generationRecentlyUpdated = data.productionRecentlyUpdated;
  const generationLikelyActive = generationActive || generationRecentlyUpdated;
  const generationInterrupted = generating && !generationLikelyActive;
  const planApproved = data.planPreview?.approved ?? false;
  const planEditable = !data.job && data.pages.length === 0;
  const canResume =
    visualApproved &&
    planApproved &&
    data.job?.status !== "completed" &&
    !generationLikelyActive &&
    data.pages.length < requiredBookPageIds.length;

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
        <>
          <ReaderConfigurationSummary reader={data.brief.readerConfiguration} />
          <aside className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-950">
            <p className="text-xs font-semibold tracking-[0.14em] uppercase">
              Family details every page must preserve
            </p>
            <p className="mt-2">
              {data.brief.mustKeep ??
                "No additional must-keep details were supplied."}
            </p>
          </aside>
        </>
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
      {result === "plan_saved" ? (
        <p
          className="mt-6 rounded-2xl bg-green-50 p-5 text-green-900"
          role="status"
        >
          The page plan is saved as a new revision. The approved story and
          visual sample were not changed; review and approve the current plan
          before production.
        </p>
      ) : null}
      {result === "plan_approved" ? (
        <p
          className="mt-6 rounded-2xl bg-green-50 p-5 text-green-900"
          role="status"
        >
          The zero-cost book plan is approved. Review the production estimate
          and start image generation when ready.
        </p>
      ) : null}
      {result === "plan_failed" ? (
        <p className="mt-6 rounded-2xl bg-red-50 p-5 text-red-900" role="alert">
          That plan change was not saved. The approved story and visual sample
          remain unchanged.
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
      {result === "book_approved" ? (
        <p
          className="mt-6 rounded-2xl bg-green-50 p-5 text-green-900"
          role="status"
        >
          The complete book is approved using the current revisions of all 16
          pages.
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
            Finish planning the pictures first
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
            Return to picture planning
          </Link>
        </section>
      ) : null}

      {visualApproved && data.planPreview ? (
        <section className="mt-10" aria-labelledby="book-plan-heading">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-sky-800">
                Zero-additional-image-cost preview
              </p>
              <h2
                className="mt-2 text-3xl font-semibold text-stone-950"
                id="book-plan-heading"
              >
                Preview all 16 pages before image generation
              </h2>
              <p className="mt-3 max-w-3xl leading-7 text-stone-700">
                This plan is assembled locally from the approved manuscript,
                character reference, Visual Bible, story beats, and family
                details. No image-provider request is made to show or revise
                these wireframes.
              </p>
            </div>
            <p
              className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${planApproved ? "bg-green-100 text-green-900" : "bg-amber-100 text-amber-950"}`}
            >
              Plan revision {data.planPreview.plan.revision} ·{" "}
              {planApproved ? "Approved" : "Ready for review"}
            </p>
          </div>

          <div className="mt-7 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-2xl font-semibold text-stone-950">
                  Contact sheet
                </h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Scan pacing, text density, locations, repeated compositions,
                  and must-show details across the whole book.
                </p>
              </div>
              <p className="text-sm font-semibold text-stone-500">
                1 cover · 1 title page · 13 story spreads · 1 closing page
              </p>
            </div>
            <ol className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {data.planPreview.plan.pages.map((planPage) => (
                <li
                  className="scroll-mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-stone-50"
                  data-testid={`plan-card-${planPage.pageId}`}
                  id={`plan-${planPage.pageId}`}
                  key={planPage.pageId}
                >
                  <PlanWireframe compact page={planPage} />
                  <div className="p-4">
                    <p className="text-xs font-semibold tracking-wide text-sky-800 uppercase">
                      Page {planPage.sequence} of 16
                    </p>
                    <h4 className="mt-1 font-semibold text-stone-950">
                      {planPage.title}
                    </h4>
                    <p className="mt-2 text-sm leading-6 text-stone-600">
                      {planPage.beat}
                    </p>
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm font-semibold text-stone-800">
                        What this page will preserve
                      </summary>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5 text-stone-600">
                        {planPage.requiredReferenceDetails.map((detail) => (
                          <li key={detail}>{detail}</li>
                        ))}
                      </ul>
                    </details>
                    {planEditable ? (
                      <details className="mt-4 border-t border-stone-200 pt-4">
                        <summary className="cursor-pointer text-sm font-semibold text-stone-950">
                          Adjust this page plan
                        </summary>
                        <PendingForm
                          action={`/api/projects/${projectId}/book/plan/pages/${planPage.pageId}`}
                          className="mt-4"
                          pendingLabel="Saving the page plan…"
                          pendingMessage="A numbered plan successor is being saved. The approved story and visual sample remain unchanged."
                          submitClassName="mt-4 w-full justify-center rounded-xl border border-stone-950 px-4 py-3 text-sm font-semibold text-stone-950"
                          submitLabel="Save page plan"
                        >
                          <label
                            className="block text-sm font-semibold text-stone-950"
                            htmlFor={`plan-text-${planPage.pageId}`}
                          >
                            Separate page text
                          </label>
                          <textarea
                            className="mt-2 block min-h-28 w-full rounded-xl border border-stone-300 p-3 text-sm leading-6"
                            defaultValue={planPage.text}
                            id={`plan-text-${planPage.pageId}`}
                            maxLength={3000}
                            name="text"
                            required
                          />
                          <label
                            className="mt-4 block text-sm font-semibold text-stone-950"
                            htmlFor={`plan-art-${planPage.pageId}`}
                          >
                            Planned illustration
                          </label>
                          <textarea
                            className="mt-2 block min-h-32 w-full rounded-xl border border-stone-300 p-3 text-sm leading-6"
                            defaultValue={planPage.illustrationDescription}
                            id={`plan-art-${planPage.pageId}`}
                            maxLength={2000}
                            name="illustrationDescription"
                            required
                          />
                          <label
                            className="mt-4 block text-sm font-semibold text-stone-950"
                            htmlFor={`plan-must-show-${planPage.pageId}`}
                          >
                            Must show or preserve
                          </label>
                          <p className="mt-1 text-xs leading-5 text-stone-500">
                            Put one required detail on each line.
                          </p>
                          <textarea
                            className="mt-2 block min-h-32 w-full rounded-xl border border-stone-300 p-3 text-sm leading-6"
                            defaultValue={planPage.requiredReferenceDetails.join(
                              "\n",
                            )}
                            id={`plan-must-show-${planPage.pageId}`}
                            maxLength={4000}
                            name="requiredReferenceDetails"
                            required
                          />
                        </PendingForm>
                      </details>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <details className="mt-6 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <summary className="cursor-pointer text-xl font-semibold text-stone-950">
              Open the one-spread-at-a-time wireframe reader
            </summary>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600">
              Scroll sideways to inspect page turns, text placement, and the
              planned visual sequence at book size. These neutral placeholders
              do not predict final composition or character fidelity; the
              approved sample remains the visual-quality reference.
            </p>
            <div className="mt-6 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-5">
              {data.planPreview.plan.pages.map((planPage) => (
                <article
                  className="w-full min-w-full snap-center"
                  data-testid="plan-reader-page"
                  key={`reader-${planPage.pageId}`}
                >
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <h3 className="font-semibold text-stone-950">
                      {planPage.title}
                    </h3>
                    <p className="text-sm text-stone-500">
                      {planPage.sequence} of 16
                    </p>
                  </div>
                  <PlanWireframe page={planPage} />
                </article>
              ))}
            </div>
          </details>

          {planEditable ? (
            <section
              className="mt-6 rounded-3xl border border-sky-200 bg-sky-50 p-6"
              aria-label="Book plan approval"
            >
              <h3 className="text-2xl font-semibold text-stone-950">
                {planApproved
                  ? "This book plan is approved"
                  : "Approve the plan before spending on full artwork"}
              </h3>
              <p className="mt-3 max-w-3xl leading-7 text-stone-700">
                {planApproved
                  ? "Production will use this exact text, illustration description, continuity, and must-show detail set. Editing any page creates a successor plan that needs fresh approval."
                  : "Approval locks this exact plan revision for production. You can still edit any page above first; those edits never overwrite the approved story or visual sample."}
              </p>
              {!planApproved ? (
                <PendingForm
                  action={`/api/projects/${projectId}/book/plan/decision`}
                  className="mt-5"
                  pendingLabel="Saving plan approval…"
                  pendingMessage="Approval is being saved for this exact 16-page plan revision. No provider request is made."
                  submitClassName="rounded-xl bg-stone-950 px-5 py-3 font-semibold text-white"
                  submitLabel="Approve this book plan"
                >
                  <input name="status" type="hidden" value="approved" />
                </PendingForm>
              ) : null}
            </section>
          ) : null}
        </section>
      ) : null}

      {visualApproved && data.estimate ? (
        <section
          className="mt-10 grid scroll-mt-6 gap-6 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm lg:grid-cols-[1fr_auto] lg:items-center"
          id="production-estimate"
        >
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
                generationInterrupted
                  ? "Resuming after interruption…"
                  : data.pages.length === 0
                    ? "Making the book…"
                    : "Resuming the book…"
              }
              pendingMessage={`${completed} of 16 pages were safely saved before this request. New pages are saved one at a time; you may save and exit while the local job continues.`}
              submitClassName="rounded-xl bg-stone-950 px-5 py-3 font-semibold text-white"
              submitLabel={
                data.job?.status === "failed"
                  ? "Retry the failed page"
                  : generationInterrupted
                    ? "Resume after interruption"
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
          ) : generationLikelyActive ? (
            <div className="max-w-sm">
              <PendingForm
                action={`/api/projects/${projectId}/book/production`}
                pendingLabel="Requesting a safe pause…"
                pendingMessage="The current provider request may finish first; no new page will start after the pause is saved."
                submitClassName="rounded-xl border border-stone-950 px-5 py-3 font-semibold text-stone-950"
                submitLabel="Stop after the current page"
              >
                <input name="action" type="hidden" value="pause" />
              </PendingForm>
            </div>
          ) : !planApproved && planEditable ? (
            <div className="max-w-sm rounded-2xl bg-amber-50 p-5 text-amber-950">
              <p className="font-semibold">Book plan approval required</p>
              <p className="mt-2 text-sm leading-6">
                Review the contact sheet and wireframe reader above, make any
                changes, then approve the current plan to unlock paid image
                production.
              </p>
              <a
                className="mt-3 inline-block font-semibold underline underline-offset-4"
                href="#book-plan-heading"
              >
                Return to the book plan
              </a>
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
          <ProductionLiveStatus
            active={generationActive}
            completed={completed}
            recentlyUpdated={generationRecentlyUpdated}
            status={data.job.status}
          />
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
                data-testid="saved-book-page"
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
                      Revision {bookPage.revision}
                    </span>
                  </div>

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

      {data.pages.length === 16 && data.preflight?.status === "passed" ? (
        <section
          className={`mt-12 rounded-3xl border p-7 ${data.bookApproval?.approved ? "border-green-200 bg-green-50" : "border-sky-200 bg-sky-50"}`}
          id="final-book-approval"
          aria-labelledby="final-book-approval-heading"
        >
          <p className="text-sm font-semibold text-sky-800">
            One final decision
          </p>
          <h2
            className="mt-2 text-3xl font-semibold text-stone-950"
            id="final-book-approval-heading"
          >
            {data.bookApproval?.approved
              ? "The complete book is approved"
              : data.bookApproval?.decision
                ? "Approve the updated complete book"
                : "Approve the complete book"}
          </h2>
          <p className="mt-3 max-w-3xl leading-7 text-stone-700">
            {data.bookApproval?.approved
              ? "This one decision covers the exact current revisions of all 16 pages. You do not need to approve pages one by one."
              : "Review and edit individual pages above as needed, then approve the book once as a whole. A later text edit or image regeneration preserves the prior decision but requires one fresh complete-book approval."}
          </p>
          {data.bookApproval?.approved ? (
            <Link
              className="mt-5 inline-block rounded-xl bg-stone-950 px-5 py-3 font-semibold text-white"
              href={`/projects/${projectId}/book/read`}
            >
              Read the approved book and download PDF
            </Link>
          ) : null}
          {!data.bookApproval?.approved ? (
            <PendingForm
              action={`/api/projects/${projectId}/book/decision`}
              className="mt-5"
              pendingLabel="Approving the complete book…"
              pendingMessage="The current revisions of all 16 pages are being recorded as one book-level decision."
              submitClassName="rounded-xl bg-stone-950 px-5 py-3 font-semibold text-white"
              submitLabel="Approve the complete book"
            >
              <input name="status" type="hidden" value="approved" />
            </PendingForm>
          ) : null}
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
