import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PendingForm } from "@/components/pending-form";
import { ProjectJourney } from "@/components/project-journey";
import { ReaderConfigurationSummary } from "@/components/reader-configuration-summary";
import { FileCharacterLibraryRepository } from "@/lib/characters/file-character-library-repository";
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
import {
  emotionalArcSchema,
  spreadMapSchema,
  visualPlanDecisionSchema,
  visualPlanIsCurrent,
  visualPlanJobSchema,
} from "@/lib/visuals/visual-narrative-artifacts";

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
  const characterLibrary = new FileCharacterLibraryRepository(
    config.characterLibraryRoot,
  );
  try {
    const [
      project,
      brief,
      story,
      storyDecision,
      emotionalArc,
      spreadMap,
      visualPlanDecision,
      visualPlanJob,
      designs,
      selectedCharacter,
      visualBible,
      sample,
      visualDecision,
      imageJob,
      progress,
      libraryCharacters,
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
          "emotional-arc.json",
          emotionalArcSchema,
        ),
      ),
      optional(
        repository.readArtifact(projectId, "spread-map.json", spreadMapSchema),
      ),
      optional(
        repository.readArtifact(
          projectId,
          "visual-plan-decision.json",
          visualPlanDecisionSchema,
        ),
      ),
      optional(
        repository.readArtifact(
          projectId,
          "visual-plan-job.json",
          visualPlanJobSchema,
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
      characterLibrary.list(),
    ]);
    return {
      project,
      brief,
      story,
      storyDecision,
      emotionalArc,
      spreadMap,
      visualPlanDecision,
      visualPlanJob,
      designs,
      selectedCharacter,
      visualBible,
      sample,
      visualDecision,
      imageJob,
      progress,
      libraryCharacters,
    };
  } catch {
    notFound();
  }
}

const assetUrl = (projectId: string, filename: string) =>
  `/api/projects/${projectId}/assets/${filename}`;

const libraryAssetUrl = (characterId: string, filename: string) =>
  `/api/characters/${characterId}/assets/${filename}`;

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
  const visualPlanApproved =
    data.story &&
    visualPlanIsCurrent({
      storyRevision: data.story.revision,
      emotionalArc: data.emotionalArc,
      spreadMap: data.spreadMap,
      decision: data.visualPlanDecision,
    });
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
        <>
          <ReaderConfigurationSummary reader={data.brief.readerConfiguration} />
          <aside className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-950">
            <p className="text-xs font-semibold tracking-[0.14em] uppercase">
              Family details to preserve
            </p>
            <p className="mt-2">
              {data.brief.mustKeep ??
                "No additional must-keep details were supplied."}
            </p>
          </aside>
        </>
      ) : null}

      {result === "failed" ? (
        <p className="mt-6 rounded-2xl bg-red-50 p-5 text-red-900" role="alert">
          The visual draft did not finish. Your approved story and the last
          saved visual artifact are still safe. Retry only this step when you
          are ready.
        </p>
      ) : null}
      {result === "plan_failed" ? (
        <p className="mt-6 rounded-2xl bg-red-50 p-5 text-red-900" role="alert">
          The visual story plan did not finish. Your approved story and the last
          saved plan are still safe. Retry only this step when you are ready.
        </p>
      ) : null}
      {result === "plan" ? (
        <p
          className="mt-6 rounded-2xl bg-green-50 p-5 text-green-900"
          role="status"
        >
          The visual story plan is ready. Check the sequence before we make
          artwork.
        </p>
      ) : null}
      {result === "plan_revised" ? (
        <p
          className="mt-6 rounded-2xl bg-green-50 p-5 text-green-900"
          role="status"
        >
          The updated visual story plan is saved. Review this revision before
          approving it.
        </p>
      ) : null}
      {result === "plan_approved" ? (
        <p
          className="mt-6 rounded-2xl bg-green-50 p-5 text-green-900"
          role="status"
        >
          Visual story plan approved. Next, choose the character&apos;s look.
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
      {result === "reused" ? (
        <p
          className="mt-6 rounded-2xl bg-green-50 p-5 text-green-900"
          role="status"
        >
          The saved character was copied into this book. The new sample is ready
          for your review.
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

      {storyApproved && !data.spreadMap ? (
        <section
          className="mt-10 rounded-3xl border border-stone-200 bg-white p-7 shadow-sm"
          aria-labelledby="visual-plan-start-heading"
        >
          <p className="text-sm font-semibold text-rose-700">
            Picture plan · Part 1
          </p>
          <h2
            className="mt-2 text-3xl font-semibold text-stone-950"
            id="visual-plan-start-heading"
          >
            Check how the story will unfold in pictures
          </h2>
          <p className="mt-3 max-w-3xl leading-7 text-stone-700">
            We will plan the main action and feeling for every part of the
            approved story. You will review the sequence before we design the
            character or make artwork.
          </p>
          <PendingForm
            action={`/api/projects/${projectId}/visuals/plan`}
            className="mt-6"
            pendingLabel="Planning the story for pictures…"
            pendingMessage="Your approved story is safe while the visual sequence is planned and saved."
            submitClassName="rounded-xl bg-stone-950 px-5 py-3 font-semibold text-white"
            submitLabel={
              data.visualPlanJob?.status === "failed"
                ? "Retry the visual story plan"
                : "Create the visual story plan"
            }
          >
            <span className="sr-only">
              The plan uses all 13 approved story spreads.
            </span>
          </PendingForm>
        </section>
      ) : null}

      {storyApproved && data.spreadMap && !visualPlanApproved ? (
        <section className="mt-10" aria-labelledby="visual-plan-heading">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-rose-700">
                Picture plan · Part 1
              </p>
              <h2
                className="mt-2 text-3xl font-semibold text-stone-950"
                id="visual-plan-heading"
              >
                Does this feel like your story?
              </h2>
              <p className="mt-3 max-w-3xl leading-7 text-stone-700">
                You do not need to inspect every production detail. Look for
                anything that feels missing, out of order, or unlike the story
                you approved.
              </p>
            </div>
            <p className="text-sm text-stone-500">
              Plan revision {data.spreadMap.revision}
            </p>
          </div>
          <div className="mt-7 rounded-3xl border border-rose-200 bg-rose-50 p-6">
            <p className="font-semibold text-stone-950">
              A quick check is enough
            </p>
            <ul className="mt-3 grid gap-2 text-sm leading-6 text-stone-700 sm:grid-cols-3">
              <li>Is the story moving in the right order?</li>
              <li>Is the most important family detail still here?</li>
              <li>Would any moment surprise you in the wrong way?</li>
            </ul>
          </div>

          <details className="mt-5 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <summary className="cursor-pointer text-lg font-semibold text-stone-950">
              Review the 13-part picture sequence
            </summary>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              Open this only if you want to check the action and feeling in each
              part before continuing.
            </p>
            <ol
              className="mt-5 divide-y divide-stone-200"
              data-testid="visual-plan-sequence"
            >
              {data.spreadMap.spreads.map((spread) => (
                <li className="py-4 first:pt-0" key={spread.spreadNumber}>
                  <div className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-sm font-semibold text-rose-800">
                      {spread.spreadNumber}
                    </span>
                    <div>
                      <h3 className="font-semibold text-stone-950">
                        {spread.storyBeat}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-stone-700">
                        {spread.mainAction}
                      </p>
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm font-semibold text-stone-600">
                          Feeling and must-keep details
                        </summary>
                        <p className="mt-2 text-sm leading-6 text-stone-600">
                          {spread.emotionalMovement}
                        </p>
                        {spread.mustShow.length > 0 ? (
                          <p className="mt-1 text-sm leading-6 text-stone-600">
                            Must show: {spread.mustShow.join("; ")}
                          </p>
                        ) : null}
                      </details>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </details>

          <div className="mt-7 rounded-3xl border border-green-200 bg-green-50 p-6">
            <h3 className="text-xl font-semibold text-green-950">
              Ready to continue?
            </h3>
            <p className="mt-2 max-w-2xl leading-7 text-green-950">
              Continue if the sequence feels right overall. You can still review
              the finished sample artwork before the complete book is made.
            </p>
            <PendingForm
              action={`/api/projects/${projectId}/visuals/plan-decision`}
              className="mt-4"
              pendingLabel="Approving the visual story plan…"
              pendingMessage="This exact plan revision is being approved."
              submitClassName="rounded-xl bg-stone-950 px-5 py-3 font-semibold text-white"
              submitLabel="Yes, continue to the character"
            >
              <input name="status" type="hidden" value="approved" />
            </PendingForm>
            <details className="mt-5 border-t border-green-200 pt-5">
              <summary className="cursor-pointer font-semibold text-green-950">
                Something feels wrong
              </summary>
              <PendingForm
                action={`/api/projects/${projectId}/visuals/plan-decision`}
                className="mt-4"
                pendingLabel="Updating the visual story plan…"
                pendingMessage="The approved story and earlier plan revision remain saved."
                submitClassName="mt-4 rounded-xl border border-stone-950 px-5 py-3 font-semibold text-stone-950"
                submitLabel="Ask for this change"
              >
                <input name="status" type="hidden" value="change_requested" />
                <label
                  className="block font-semibold text-stone-950"
                  htmlFor="visual-plan-feedback"
                >
                  Tell us what feels wrong or missing
                </label>
                <textarea
                  className="mt-2 min-h-28 w-full rounded-xl border border-stone-300 bg-white p-3"
                  id="visual-plan-feedback"
                  maxLength={1000}
                  name="feedback"
                  required
                />
              </PendingForm>
            </details>
          </div>
        </section>
      ) : null}

      {storyApproved && data.spreadMap && visualPlanApproved ? (
        <details className="mt-10 rounded-2xl border border-green-200 bg-green-50 p-5">
          <summary className="cursor-pointer font-semibold text-green-950">
            Approved visual story plan · revision {data.spreadMap.revision}
          </summary>
          <ol className="mt-5 grid gap-3 md:grid-cols-2">
            {data.spreadMap.spreads.map((spread) => (
              <li
                className="rounded-xl border border-green-200 bg-white p-4"
                key={spread.spreadNumber}
              >
                <p className="text-xs font-semibold text-rose-700 uppercase">
                  Spread {spread.spreadNumber}
                </p>
                <p className="mt-1 font-semibold text-stone-950">
                  {spread.mainAction}
                </p>
                <p className="mt-1 text-sm text-stone-600">
                  {spread.emotionalMovement}
                </p>
              </li>
            ))}
          </ol>
        </details>
      ) : null}

      {storyApproved && visualPlanApproved && !data.designs ? (
        <section className="mt-10" aria-labelledby="art-look-heading">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-rose-700">
              Visual identity · Part 2
            </p>
            <h2
              className="mt-2 text-3xl font-semibold text-stone-950"
              id="art-look-heading"
            >
              Choose an art direction
            </h2>
            <p className="mt-3 leading-7 text-stone-700">
              Each curated look controls medium, line, color, lighting, shape,
              and texture. The same pea-and-wagon scene below makes the
              differences easier to compare. We will make three disposable
              character drafts from your choice; no unrestricted style prompt is
              used.
            </p>
          </div>
          {data.libraryCharacters.length > 0 ? (
            <section
              aria-labelledby="saved-characters-heading"
              className="mt-7 rounded-3xl border border-green-200 bg-green-50 p-6"
            >
              <h3
                className="text-2xl font-semibold text-green-950"
                id="saved-characters-heading"
              >
                Reuse a saved character
              </h3>
              <p className="mt-2 max-w-3xl leading-7 text-green-950">
                These approved characters are already saved on this device.
                Reusing one skips three new character drafts. An exact copy is
                placed in this book before its sample is made.
              </p>
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {data.libraryCharacters.map((character) => {
                  const preset = getArtPreset(character.rendition.presetId);
                  return (
                    <article
                      className="overflow-hidden rounded-2xl border border-green-200 bg-white"
                      key={character.id}
                    >
                      <div className="relative aspect-square bg-stone-100">
                        <Image
                          alt={`${character.displayName} saved character reference`}
                          className="object-cover"
                          fill
                          sizes="(min-width: 1024px) 33vw, 100vw"
                          src={libraryAssetUrl(
                            character.id,
                            character.rendition.referenceAssetFilename,
                          )}
                          unoptimized
                        />
                      </div>
                      <div className="p-4">
                        <h4 className="text-lg font-semibold text-stone-950">
                          {character.displayName}
                        </h4>
                        <p className="mt-1 text-sm text-stone-600">
                          {preset.label} · saved from an approved choice
                        </p>
                        <PendingForm
                          action={`/api/projects/${projectId}/visuals/reuse-character`}
                          className="mt-4"
                          pendingLabel={`Using ${character.displayName} and making the sample…`}
                          pendingMessage="The library original stays unchanged while an exact copy is saved in this book."
                          submitClassName="w-full justify-center rounded-xl bg-stone-950 px-4 py-3 font-semibold text-white"
                          submitLabel={`Reuse ${character.displayName}`}
                        >
                          <input
                            name="characterId"
                            type="hidden"
                            value={character.id}
                          />
                        </PendingForm>
                      </div>
                    </article>
                  );
                })}
              </div>
              <p className="mt-5 border-t border-green-200 pt-5 text-sm text-green-950">
                Need someone new? Choose an art direction below to create three
                new drafts.
              </p>
            </section>
          ) : null}
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
                  className="group cursor-pointer overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition focus-within:ring-2 focus-within:ring-rose-700 focus-within:ring-offset-2 hover:-translate-y-0.5 hover:border-rose-400 has-checked:border-rose-700 has-checked:ring-2 has-checked:ring-rose-100 motion-reduce:transform-none"
                  key={preset.id}
                >
                  <span className="relative block aspect-[4/3] overflow-hidden bg-stone-100">
                    <Image
                      alt={preset.previewAlt}
                      className="object-cover transition duration-300 group-hover:scale-[1.02] motion-reduce:transform-none"
                      fill
                      loading="eager"
                      sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                      src={preset.previewImage}
                    />
                  </span>
                  <span className="block p-5">
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
                  </span>
                </label>
              ))}
            </fieldset>
          </PendingForm>
        </section>
      ) : null}

      {storyApproved && visualPlanApproved && data.designs && !data.sample ? (
        <section className="mt-10" aria-labelledby="character-heading">
          <p className="text-sm font-semibold text-rose-700">
            Visual identity · Part 3
          </p>
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

      {storyApproved &&
      visualPlanApproved &&
      data.sample &&
      data.visualBible ? (
        <section className="mt-10" aria-labelledby="sample-heading">
          <p className="text-sm font-semibold text-rose-700">
            Visual identity · Final review
          </p>
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
              What we’ll keep consistent in every picture
            </summary>
            <div className="mt-4 grid gap-5 text-sm leading-6 text-stone-700 md:grid-cols-3">
              <div>
                <h3 className="font-semibold text-stone-950">Main character</h3>
                <p className="mt-1">
                  The same {data.visualBible.mainCharacter.description} will
                  appear throughout the book.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-stone-950">
                  Colors and art style
                </h3>
                <p className="mt-1">
                  We’ll use the {currentPreset?.label.toLowerCase() ?? "chosen"}{" "}
                  art style and these colors across every page.
                </p>
                <div
                  aria-label="Selected color palette"
                  className="mt-2 flex gap-2"
                >
                  {data.visualBible.palette.map((swatch) => (
                    <span
                      aria-hidden="true"
                      className="size-8 rounded-full border border-black/10"
                      key={swatch}
                      style={{ backgroundColor: swatch }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-stone-950">
                  Space for the story text
                </h3>
                <p className="mt-1">
                  We’ll keep the upper-left area simple so the words are easy to
                  read. Words will be added separately, not drawn into the
                  picture.
                </p>
              </div>
            </div>
          </details>

          <section
            className="mt-8 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm"
            aria-label="Visual approval"
          >
            <h2 className="text-2xl font-semibold text-stone-950">
              Approve or change this visual direction
            </h2>
            {visualApproved ? (
              <div className="mt-4 rounded-2xl bg-green-50 p-5 text-green-900">
                <p className="font-semibold">Your book’s look is approved.</p>
                <p className="mt-2">
                  Next, review the plan for the complete book, including its
                  pages and estimated illustration cost. Nothing will be
                  generated or charged until you confirm.
                </p>
                <Link
                  className="mt-4 inline-block rounded-xl bg-stone-950 px-5 py-3 font-semibold text-white"
                  href={`/projects/${projectId}/book`}
                >
                  Review the book plan
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
