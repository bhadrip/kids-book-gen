import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PendingForm } from "@/components/pending-form";
import { ProjectJourney } from "@/components/project-journey";
import { readAppConfig } from "@/lib/config/app-config";
import { FileProjectRepository } from "@/lib/projects/file-project-repository";
import { getProjectProgress } from "@/lib/projects/project-progress";
import {
  projectBriefSchema,
  storyDecisionSchema,
  storyPackageSchema,
} from "@/lib/projects/project";
import { artPresets, getArtPreset } from "@/lib/visuals/art-presets";
import {
  characterDesignsSchema,
  imageGenerationJobSchema,
  sampleSpreadSchema,
  selectedCharacterSchema,
  visualBibleSchema,
  visualDecisionSchema,
} from "@/lib/visuals/visual-artifacts";

export const runtime = "nodejs";

async function optional<T>(operation: Promise<T>): Promise<T | null> {
  return operation.catch(() => null);
}

async function loadLook(projectId: string) {
  const config = readAppConfig(process.env);
  const repository = new FileProjectRepository(config.projectRoot, {
    now: () => new Date(),
    createId: () => crypto.randomUUID(),
  });
  try {
    const [
      project,
      brief,
      story,
      storyDecision,
      designs,
      selectedCharacter,
      visualBible,
      sample,
      visualDecision,
      imageJob,
      progress,
    ] = await Promise.all([
      repository.load(projectId),
      optional(
        repository.readArtifact(projectId, "brief.json", projectBriefSchema),
      ),
      optional(
        repository.readArtifact(projectId, "story.json", storyPackageSchema),
      ),
      optional(
        repository.readArtifact(
          projectId,
          "story-decision.json",
          storyDecisionSchema,
        ),
      ),
      optional(
        repository.readArtifact(
          projectId,
          "character-designs.json",
          characterDesignsSchema,
        ),
      ),
      optional(
        repository.readArtifact(
          projectId,
          "selected-character.json",
          selectedCharacterSchema,
        ),
      ),
      optional(
        repository.readArtifact(
          projectId,
          "visual-bible.json",
          visualBibleSchema,
        ),
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
          "image-generation-job.json",
          imageGenerationJobSchema,
        ),
      ),
      getProjectProgress(repository, projectId),
    ]);
    return {
      project,
      brief,
      story,
      storyDecision,
      designs,
      selectedCharacter,
      visualBible,
      sample,
      visualDecision,
      imageJob,
      progress,
    };
  } catch {
    notFound();
  }
}

const assetUrl = (projectId: string, filename: string) =>
  `/api/projects/${projectId}/assets/${filename}`;

export default async function LookPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ result?: string }>;
}) {
  const { projectId } = await params;
  const { result } = await searchParams;
  const data = await loadLook(projectId);
  const storyApproved =
    data.story &&
    data.storyDecision?.status === "approved" &&
    data.storyDecision.storyRevision === data.story.revision;
  const currentPreset = data.visualBible
    ? getArtPreset(data.visualBible.presetId)
    : data.designs
      ? getArtPreset(data.designs.presetId)
      : null;
  const visualApproved =
    data.sample &&
    data.visualDecision?.status === "approved" &&
    data.visualDecision.sampleRevision === data.sample.revision;

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
      <ProjectJourney
        current="look"
        projectId={projectId}
        projectTitle={data.project.title}
        statuses={data.progress}
      />
      <div className="mt-10 flex flex-col gap-4 border-b border-stone-200 pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-[0.18em] text-rose-700 uppercase">
            Visual identity
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
            Find the look that belongs to this story.
          </h1>
        </div>
        <p className="max-w-md text-sm leading-6 text-stone-600">
          The artwork is AI-created and remains a draft until you approve the
          character and this sample spread.
        </p>
      </div>

      {data.brief ? (
        <aside className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-950">
          <p className="text-xs font-semibold tracking-[0.14em] uppercase">
            Family details to preserve
          </p>
          <p className="mt-2">
            {data.brief.mustKeep ??
              "No additional must-keep details were supplied."}
          </p>
        </aside>
      ) : null}

      {result === "failed" ? (
        <p className="mt-6 rounded-2xl bg-red-50 p-5 text-red-900" role="alert">
          The visual draft did not finish. Your approved story and the last
          saved visual artifact are still safe. Retry only this step when you
          are ready.
        </p>
      ) : null}
      {result === "designs" ? (
        <p
          className="mt-6 rounded-2xl bg-green-50 p-5 text-green-900"
          role="status"
        >
          Three character designs are saved and ready for your choice.
        </p>
      ) : null}
      {result === "sample" || result === "change_requested" ? (
        <p
          className="mt-6 rounded-2xl bg-green-50 p-5 text-green-900"
          role="status"
        >
          The sample spread is saved and ready for your review.
        </p>
      ) : null}
      {result === "text_saved" ? (
        <p
          className="mt-6 rounded-2xl bg-green-50 p-5 text-green-900"
          role="status"
        >
          The separate sample text is saved. Review this new sample revision
          before approving it.
        </p>
      ) : null}
      {result === "approved" ? (
        <p
          className="mt-6 rounded-2xl bg-green-50 p-5 text-green-900"
          role="status"
        >
          Visual direction approved and saved.
        </p>
      ) : null}

      {!storyApproved ? (
        <section className="mt-10 rounded-3xl border border-stone-200 bg-white p-7 shadow-sm">
          <p className="text-sm font-semibold text-rose-700">Story first</p>
          <h2 className="mt-2 text-2xl font-semibold text-stone-950">
            Approve the manuscript before making artwork.
          </h2>
          <p className="mt-3 max-w-2xl leading-7 text-stone-700">
            The character and sample need a stable story. Your current work is
            preserved; approving the manuscript unlocks this checkpoint.
          </p>
          <Link
            className="mt-5 inline-block rounded-xl bg-stone-950 px-5 py-3 font-semibold text-white"
            href={`/projects/${projectId}/story`}
          >
            Review the story
          </Link>
        </section>
      ) : null}

      {storyApproved && !data.designs ? (
        <section className="mt-10" aria-labelledby="art-look-heading">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-rose-700">Part 1 of 3</p>
            <h2
              className="mt-2 text-3xl font-semibold text-stone-950"
              id="art-look-heading"
            >
              Choose an art direction
            </h2>
            <p className="mt-3 leading-7 text-stone-700">
              Each curated look controls medium, line, color, lighting, shape,
              and texture. We will make three disposable character drafts from
              your choice; no unrestricted style prompt is used.
            </p>
          </div>
          <PendingForm
            action={`/api/projects/${projectId}/visuals/character-designs`}
            className="mt-7"
            pendingLabel="Creating three character designs…"
            pendingMessage="Your approved story is safe while three low-cost character drafts are created and saved locally."
            submitClassName="mt-7 rounded-xl bg-stone-950 px-5 py-3 font-semibold text-white"
            submitLabel={
              data.imageJob?.status === "failed"
                ? "Retry three character designs"
                : "Create three character designs"
            }
          >
            <fieldset className="grid gap-4 border-0 p-0 md:grid-cols-2 xl:grid-cols-3">
              <legend className="sr-only">Choose an art direction</legend>
              {artPresets.map((preset, index) => (
                <label
                  className="group cursor-pointer rounded-3xl border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-400 has-checked:border-rose-700 has-checked:ring-2 has-checked:ring-rose-100"
                  key={preset.id}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-stone-950">
                      {preset.label}
                    </span>
                    <input
                      defaultChecked={index === 0}
                      name="presetId"
                      required
                      type="radio"
                      value={preset.id}
                    />
                  </span>
                  <span className="mt-4 flex gap-2" aria-hidden="true">
                    {preset.swatches.map((swatch) => (
                      <span
                        className="size-9 rounded-full border border-black/10"
                        key={swatch}
                        style={{ backgroundColor: swatch }}
                      />
                    ))}
                  </span>
                  <span className="mt-4 block text-sm leading-6 text-stone-600">
                    {preset.shortDescription}
                  </span>
                  <span className="mt-3 block text-xs font-medium text-stone-500">
                    {preset.medium} · {preset.detailLevel} detail
                  </span>
                </label>
              ))}
            </fieldset>
          </PendingForm>
        </section>
      ) : null}

      {storyApproved && data.designs && !data.sample ? (
        <section className="mt-10" aria-labelledby="character-heading">
          <p className="text-sm font-semibold text-rose-700">Part 2 of 3</p>
          <h2
            className="mt-2 text-3xl font-semibold text-stone-950"
            id="character-heading"
          >
            Choose the character your child will recognize
          </h2>
          <p className="mt-3 max-w-3xl leading-7 text-stone-700">
            These three drafts use the {currentPreset?.label.toLowerCase()}{" "}
            look. Choosing one saves an exact reference, builds the Visual
            Bible, and creates one sample spread. The two siblings remain
            preserved.
          </p>
          <div className="mt-7 grid gap-6 lg:grid-cols-3">
            {data.designs.options.map((option, index) => (
              <section
                aria-label={`Character design ${index + 1}`}
                className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm"
                key={option.id}
              >
                <div className="relative aspect-square bg-stone-100">
                  <Image
                    alt={option.altText}
                    className="object-cover"
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    src={assetUrl(projectId, option.assetFilename)}
                    unoptimized
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-stone-950">
                    Character design {index + 1}
                  </h3>
                  <PendingForm
                    action={`/api/projects/${projectId}/visuals/select-character`}
                    className="mt-4"
                    pendingLabel="Saving this character and making the sample…"
                    pendingMessage="This character reference is saved first. The approved story remains safe while spread 7 is illustrated."
                    submitClassName="w-full justify-center rounded-xl bg-stone-950 px-4 py-3 font-semibold text-white"
                    submitLabel={`Choose design ${index + 1}`}
                  >
                    <input name="optionId" type="hidden" value={option.id} />
                  </PendingForm>
                </div>
              </section>
            ))}
          </div>
          <div className="mt-7 flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-stone-950">
                Character design set {data.designs.revision}
              </p>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-stone-600">
                Not seeing the right character yet? Generate three new options.
                This design set remains saved as an earlier revision.
              </p>
            </div>
            <PendingForm
              action={`/api/projects/${projectId}/visuals/character-designs`}
              pendingLabel="Regenerating three character designs…"
              pendingMessage="This design set and the approved story remain safe while three new character drafts are created."
              submitClassName="shrink-0 rounded-xl border border-stone-950 px-5 py-3 font-semibold text-stone-950"
              submitLabel="Regenerate three designs"
            >
              <input
                name="presetId"
                type="hidden"
                value={data.designs.presetId}
              />
            </PendingForm>
          </div>
        </section>
      ) : null}

      {storyApproved && data.sample && data.visualBible ? (
        <section className="mt-10" aria-labelledby="sample-heading">
          <p className="text-sm font-semibold text-rose-700">Part 3 of 3</p>
          <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2
                className="text-3xl font-semibold text-stone-950"
                id="sample-heading"
              >
                Review the sample spread
              </h2>
              <p className="mt-3 max-w-3xl leading-7 text-stone-700">
                Spread 7 tests the recurring character, atmosphere, composition,
                and real book layout before full production begins.
              </p>
            </div>
            <p className="text-sm text-stone-500">
              Sample revision {data.sample.revision}
            </p>
          </div>

          <div className="mt-7 overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-xl shadow-stone-200/60">
            <div className="relative aspect-[3/2] min-h-[32rem] bg-stone-200">
              <Image
                alt={data.sample.altText}
                className="object-cover"
                fill
                priority
                sizes="100vw"
                src={assetUrl(projectId, data.sample.assetFilename)}
                unoptimized
              />
              <div className="absolute top-[7%] left-[5%] max-h-[62%] w-[42%] overflow-auto rounded-2xl bg-[#fffdf7]/94 p-5 shadow-lg backdrop-blur-sm sm:p-7">
                <p className="text-xs font-semibold tracking-[0.14em] text-rose-700 uppercase">
                  Spread {data.sample.spreadNumber}
                </p>
                <p
                  className="mt-3 text-base leading-7 text-stone-950 sm:text-lg sm:leading-8"
                  data-testid="sample-spread-text"
                >
                  {data.sample.text}
                </p>
              </div>
            </div>
            <div className="grid gap-5 border-t border-stone-200 p-6 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="font-semibold text-stone-950">
                  {data.sample.beat}
                </p>
                <p className="mt-1 text-sm text-stone-600">
                  The story text is a separate HTML layer and is not baked into
                  the illustration.
                </p>
              </div>
              {data.selectedCharacter ? (
                <div className="flex items-center gap-3 rounded-2xl bg-stone-100 p-3">
                  <Image
                    alt="Approved character reference"
                    className="size-14 rounded-xl object-cover"
                    height={56}
                    src={assetUrl(
                      projectId,
                      data.selectedCharacter.referenceAssetFilename,
                    )}
                    unoptimized
                    width={56}
                  />
                  <span className="text-sm font-semibold text-stone-700">
                    Saved character reference
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          <details className="mt-6 rounded-2xl border border-stone-200 bg-white p-5">
            <summary className="cursor-pointer font-semibold text-stone-950">
              What this visual identity will preserve
            </summary>
            <div className="mt-4 grid gap-5 text-sm leading-6 text-stone-700 md:grid-cols-3">
              <div>
                <h3 className="font-semibold text-stone-950">Character</h3>
                <p className="mt-1">
                  {data.visualBible.mainCharacter.description}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-stone-950">Palette</h3>
                <div className="mt-2 flex gap-2">
                  {data.visualBible.palette.map((swatch) => (
                    <span
                      className="size-8 rounded-full border border-black/10"
                      key={swatch}
                      style={{ backgroundColor: swatch }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-stone-950">Text safety</h3>
                <p className="mt-1">
                  Keep the upper-left calm and never render words into artwork.
                </p>
              </div>
            </div>
          </details>

          <PendingForm
            action={`/api/projects/${projectId}/visuals/sample-text`}
            className="mt-6 rounded-2xl border border-stone-200 bg-white p-5"
            pendingLabel="Saving the separate text layer…"
            pendingMessage="The illustration and approved manuscript remain unchanged while this sample-layout text is saved as a new revision."
            submitClassName="mt-4 rounded-xl border border-stone-950 px-5 py-3 font-semibold text-stone-950"
            submitLabel="Save sample text"
          >
            <label
              className="block font-semibold text-stone-950"
              htmlFor="sample-text"
            >
              Edit the text shown on this sample
            </label>
            <p className="mt-1 text-sm text-stone-600">
              This changes only the separate layout text, never the artwork or
              approved manuscript.
            </p>
            <textarea
              className="mt-3 block min-h-32 w-full rounded-xl border border-stone-300 p-3 leading-7 outline-none focus:border-rose-700 focus:ring-2 focus:ring-rose-100"
              defaultValue={data.sample.text}
              id="sample-text"
              maxLength={3000}
              name="text"
              required
            />
          </PendingForm>

          <section
            className="mt-8 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm"
            aria-label="Visual approval"
          >
            <h2 className="text-2xl font-semibold text-stone-950">
              Approve or change this visual direction
            </h2>
            {visualApproved ? (
              <div className="mt-4 rounded-2xl bg-green-50 p-5 text-green-900">
                <p className="font-semibold">This visual sample is approved.</p>
                <p className="mt-2">
                  Full-book production is unlocked. Review its page count and
                  cost estimate before starting the sequential job.
                </p>
                <Link
                  className="mt-4 inline-block rounded-xl bg-stone-950 px-5 py-3 font-semibold text-white"
                  href={`/projects/${projectId}/book`}
                >
                  Review production estimate
                </Link>
              </div>
            ) : (
              <PendingForm
                action={`/api/projects/${projectId}/visuals/decision`}
                className="mt-5"
                pendingLabel="Saving visual approval…"
                pendingMessage="Saving approval for this exact character reference, Visual Bible, and sample revision."
                submitClassName="rounded-xl bg-stone-950 px-5 py-3 font-semibold text-white"
                submitLabel="Approve this visual direction"
              >
                <input name="status" type="hidden" value="approved" />
              </PendingForm>
            )}
            <PendingForm
              action={`/api/projects/${projectId}/visuals/decision`}
              className="mt-6 border-t border-stone-200 pt-6"
              pendingLabel="Revising only the sample spread…"
              pendingMessage="The selected character, approved story, and current sample remain saved while a numbered successor is created."
              submitClassName="mt-3 rounded-xl border border-stone-950 px-5 py-3 font-semibold text-stone-950"
              submitLabel="Change the sample spread"
            >
              <input name="status" type="hidden" value="change_requested" />
              <label
                className="block font-semibold text-stone-950"
                htmlFor="visual-feedback"
              >
                What should change—and what must stay?
              </label>
              <textarea
                className="mt-2 block min-h-28 w-full rounded-xl border border-stone-300 p-3 outline-none focus:border-rose-700 focus:ring-2 focus:ring-rose-100"
                id="visual-feedback"
                name="feedback"
                required
              />
            </PendingForm>
          </section>
        </section>
      ) : null}
    </main>
  );
}
