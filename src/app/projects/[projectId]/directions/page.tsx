import { notFound } from "next/navigation";
import { PendingForm } from "@/components/pending-form";
import { ProjectJourney } from "@/components/project-journey";
import { readAppConfig } from "@/lib/config/app-config";
import { FileProjectRepository } from "@/lib/projects/file-project-repository";
import { getProjectProgress } from "@/lib/projects/project-progress";
import {
  projectBriefSchema,
  storyDirectionsSchema,
  textGenerationJobSchema,
} from "@/lib/projects/project";
export const runtime = "nodejs";

async function loadDirections(projectId: string) {
  const config = readAppConfig(process.env);
  const repository = new FileProjectRepository(config.projectRoot, {
    now: () => new Date(),
    createId: () => crypto.randomUUID(),
  });
  try {
    const [project, directions, brief, job, progress] = await Promise.all([
      repository.load(projectId),
      repository.readArtifact(
        projectId,
        "directions.json",
        storyDirectionsSchema,
      ),
      repository.readArtifact(projectId, "brief.json", projectBriefSchema),
      repository
        .readArtifact(
          projectId,
          "text-generation-job.json",
          textGenerationJobSchema,
        )
        .catch(() => null),
      getProjectProgress(repository, projectId),
    ]);
    return { project, directions, brief, job, progress };
  } catch {
    notFound();
  }
}

export default async function DirectionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ revision?: string; story?: string }>;
}) {
  const { projectId } = await params;
  const { revision, story } = await searchParams;
  const { project, directions, brief, job, progress } =
    await loadDirections(projectId);
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <ProjectJourney
        current="directions"
        projectId={projectId}
        projectTitle={project.title}
        statuses={progress}
      />
      <h1 className="mt-4 text-4xl font-semibold text-stone-950">
        Three ways this story could go
      </h1>
      <p className="mt-4 text-stone-700">
        Must keep:{" "}
        {brief.mustKeep ?? "No additional must-keep details provided."}
      </p>
      <p className="mt-2 text-sm text-stone-500">
        Direction revision {directions.revision}
      </p>
      <p className="mt-2 text-sm text-stone-600">
        All three directions are saved locally. Choose one to create a text-only
        13-spread draft, or steer a new set. Every result remains a draft until
        you approve it.
      </p>
      {revision === "failed" ? (
        <p className="mt-4 rounded-xl bg-red-50 p-4 text-red-800" role="alert">
          We could not revise the directions. Your previous directions are still
          saved.
        </p>
      ) : null}
      {story === "failed" ? (
        <section
          className="mt-4 rounded-xl bg-red-50 p-4 text-red-900"
          role="alert"
          aria-labelledby="story-failure-heading"
        >
          <h2 className="font-semibold" id="story-failure-heading">
            Story generation stopped
          </h2>
          <p className="mt-2">
            {job?.failureMessage ??
              "The AI provider could not complete this step."}
          </p>
          <p className="mt-2 text-sm">
            Your direction choice and feedback are saved.
            {job?.lastSavedArtifact === "story.json"
              ? " The manuscript is also saved, so retry will continue with its quality review."
              : " Retry the same direction to continue."}
          </p>
        </section>
      ) : null}
      <div className="mt-8 space-y-5">
        {directions.directions.map((direction) => (
          <section
            className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm"
            key={direction.title}
            aria-label={direction.title}
          >
            <h2 className="text-xl font-semibold">{direction.title}</h2>
            <p className="mt-2 font-semibold text-amber-800">
              {direction.storyEngine}
            </p>
            <p className="mt-3">{direction.promise}</p>
            <p className="mt-3 text-stone-700">Opens: {direction.opening}</p>
            <p className="mt-2 text-stone-700">Ends: {direction.ending}</p>
            <PendingForm
              action={`/api/projects/${projectId}/select-direction`}
              className="mt-5"
              pendingLabel="Generating this story…"
              pendingMessage="Your direction choice and steering are saved. We are drafting 13 text spreads for your review; return to the overview if the request is interrupted."
              submitClassName="mt-3 rounded-xl bg-stone-950 px-4 py-2 font-semibold text-white"
              submitLabel={
                story === "failed"
                  ? "Retry this direction"
                  : "Choose this direction"
              }
            >
              <input
                name="directionTitle"
                type="hidden"
                value={direction.title}
              />
              <label
                className="block font-semibold"
                htmlFor={`feedback-${direction.title}`}
              >
                Any steering for the next story step? (optional)
                <textarea
                  className="mt-2 block w-full rounded-xl border p-3"
                  id={`feedback-${direction.title}`}
                  name="parentFeedback"
                  placeholder="Keep the moon kite, but make the ending funnier."
                />
              </label>
            </PendingForm>
          </section>
        ))}
      </div>
      <PendingForm
        action={`/api/projects/${projectId}/revise-directions`}
        className="mt-8 rounded-3xl border border-stone-200 bg-white p-6"
        pendingLabel="Revising all three directions…"
        pendingMessage="Your current directions remain saved while we create a new numbered revision from your steering."
        submitClassName="mt-3 rounded-xl border border-stone-950 px-4 py-2 font-semibold"
        submitLabel="Revise all three directions"
      >
        <label className="block font-semibold" htmlFor="parentSteering">
          Want three different directions?
          <textarea
            className="mt-2 block w-full rounded-xl border p-3"
            id="parentSteering"
            name="parentSteering"
            placeholder="Make them funnier and keep the adventure close to home."
            required
          />
        </label>
      </PendingForm>
    </main>
  );
}
