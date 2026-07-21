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
  storyEvaluationSchema,
  storyPackageSchema,
} from "@/lib/projects/project";

const evaluationLabels = {
  ideaFidelity: "Idea fidelity",
  causalStructure: "Causal structure",
  ageFit: "Age fit",
  oralFlow: "Read-aloud flow",
  safety: "Safety",
} as const;

const outcomeLabels = {
  pass: "Passed",
  revision_required: "Revision requested",
  escalation_required: "Needs human review",
} as const;

export const runtime = "nodejs";
async function loadStory(projectId: string) {
  const config = readAppConfig(process.env);
  const repository = new FileProjectRepository(config.projectRoot, {
    now: () => new Date(),
    createId: () => crypto.randomUUID(),
  });
  try {
    const [project, story, brief, decision, evaluation, progress] =
      await Promise.all([
        repository.load(projectId),
        repository.readArtifact(projectId, "story.json", storyPackageSchema),
        repository.readArtifact(projectId, "brief.json", projectBriefSchema),
        repository
          .readArtifact(projectId, "story-decision.json", storyDecisionSchema)
          .catch(() => null),
        repository
          .readArtifact(
            projectId,
            "story-evaluation.json",
            storyEvaluationSchema,
          )
          .catch(() => null),
        getProjectProgress(repository, projectId),
      ]);
    return {
      project,
      story,
      brief,
      decision,
      evaluation:
        evaluation?.storyRevision === story.revision ? evaluation : null,
      progress,
    };
  } catch {
    notFound();
  }
}
export default async function StoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ decision?: string }>;
}) {
  const { projectId } = await params;
  const { decision: decisionQuery } = await searchParams;
  const { project, story, brief, decision, evaluation, progress } =
    await loadStory(projectId);
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <ProjectJourney
        current="story"
        projectId={projectId}
        projectTitle={project.title}
        statuses={progress}
      />
      <h1 className="mt-4 text-4xl font-semibold">{story.title}</h1>
      <p className="mt-4 text-stone-700">{story.promise}</p>
      <p className="mt-4 rounded-xl bg-amber-50 p-4 text-amber-900">
        Must keep:{" "}
        {brief.mustKeep ?? "No additional must-keep details provided."}
      </p>
      <p className="mt-2 text-sm text-stone-500">
        Story revision {story.revision}
      </p>
      <p className="mt-2 text-sm text-stone-600">
        This AI-created manuscript is a draft for your review. Approving it
        saves this exact revision; requesting a change keeps this copy while a
        numbered successor is generated.
      </p>
      {decisionQuery === "approved" ? (
        <p
          className="mt-4 rounded-xl bg-green-50 p-4 text-green-800"
          role="status"
        >
          Story approved and saved.
        </p>
      ) : null}
      {decisionQuery === "revision_requested" ? (
        <p
          className="mt-4 rounded-xl bg-green-50 p-4 text-green-800"
          role="status"
        >
          Your revised story is ready.
        </p>
      ) : null}
      {decisionQuery === "failed" ? (
        <p className="mt-4 rounded-xl bg-red-50 p-4 text-red-800" role="alert">
          We could not apply that decision. Your current story is still saved.
        </p>
      ) : null}
      <section className="mt-8">
        <h2 className="text-2xl font-semibold">Story map</h2>
        <p className="mt-2">Beginning: {story.arc.beginning}</p>
        <p>Middle: {story.arc.middle}</p>
        <p>Ending: {story.arc.ending}</p>
      </section>
      <ol className="mt-6 space-y-4">
        {story.spreads.map((spread) => (
          <li className="rounded-xl border p-4" key={spread.number}>
            <strong>
              Spread {spread.number}: {spread.beat}
            </strong>
            <p className="mt-2">{spread.text}</p>
          </li>
        ))}
      </ol>
      {evaluation ? (
        <details className="mt-8 rounded-3xl border border-sky-200 bg-sky-50 p-6">
          <summary className="cursor-pointer font-semibold text-sky-950">
            How AI reviewed this story
          </summary>
          <section aria-label="AI story evaluation" className="mt-5">
            <p className="text-sm text-sky-950">
              This is an AI quality prediction, not a fact about how a child
              will respond. Evaluation for story revision{" "}
              {evaluation.storyRevision} was created{" "}
              {new Date(evaluation.evaluatedAt).toLocaleString()} using{" "}
              <code>{evaluation.model}</code>.
            </p>
            <p className="mt-3 font-semibold text-sky-950">
              Overall result: {outcomeLabels[evaluation.outcome]}
            </p>
            <dl className="mt-4 space-y-4">
              {Object.entries(evaluation.dimensions).map(([key, dimension]) => (
                <div className="rounded-xl bg-white p-4" key={key}>
                  <dt className="font-semibold">
                    {evaluationLabels[key as keyof typeof evaluationLabels]}:{" "}
                    {outcomeLabels[dimension.outcome]}
                  </dt>
                  <dd className="mt-2 text-sm text-stone-700">
                    <ul className="list-disc space-y-1 pl-5">
                      {dimension.evidence.map((evidence) => (
                        <li key={evidence}>{evidence}</li>
                      ))}
                    </ul>
                    {dimension.revisionInstruction ? (
                      <p className="mt-2">
                        Suggested change: {dimension.revisionInstruction}
                      </p>
                    ) : null}
                  </dd>
                </div>
              ))}
            </dl>
            {evaluation.preserve.length > 0 ? (
              <div className="mt-4">
                <h3 className="font-semibold">
                  What the AI was told to preserve
                </h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                  {evaluation.preserve.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {evaluation.revisionInstructions.length > 0 ? (
              <div className="mt-4">
                <h3 className="font-semibold">Requested revisions</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                  {evaluation.revisionInstructions.map((instruction) => (
                    <li key={instruction}>{instruction}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        </details>
      ) : null}
      <section
        className="mt-8 rounded-3xl border border-stone-200 bg-white p-6"
        aria-label="Story approval"
      >
        <h2 className="text-2xl font-semibold">Approve or revise</h2>
        {decision?.status === "approved" &&
        decision.storyRevision === story.revision ? (
          <p className="mt-2 font-semibold text-green-800">
            This story revision is approved.
          </p>
        ) : null}
        <PendingForm
          action={`/api/projects/${projectId}/story-decision`}
          className="mt-4"
          pendingLabel="Saving story approval…"
          pendingMessage="Saving your approval for this exact story revision locally."
          submitClassName="rounded-xl bg-stone-950 px-4 py-2 font-semibold text-white"
          submitLabel="Approve this story"
        >
          <input name="status" type="hidden" value="approved" />
        </PendingForm>
        <PendingForm
          action={`/api/projects/${projectId}/story-decision`}
          className="mt-5"
          pendingLabel="Revising this story…"
          pendingMessage="Your current story remains saved while we create a new numbered revision from your feedback."
          submitClassName="mt-3 rounded-xl border border-stone-950 px-4 py-2 font-semibold"
          submitLabel={
            decisionQuery === "failed"
              ? "Retry story revision"
              : "Revise this story"
          }
        >
          <input name="status" type="hidden" value="revision_requested" />
          <label className="block font-semibold" htmlFor="feedback">
            What should change?
            <textarea
              className="mt-2 block w-full rounded-xl border p-3"
              id="feedback"
              name="feedback"
              required
            />
          </label>
        </PendingForm>
      </section>
      <Link
        className="mt-6 inline-block font-semibold text-amber-800 underline"
        href={`/projects/${projectId}/directions`}
      >
        Back to directions
      </Link>
    </main>
  );
}
