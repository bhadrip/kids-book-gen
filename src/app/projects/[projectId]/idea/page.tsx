import { notFound } from "next/navigation";

import { PendingForm } from "@/components/pending-form";
import { ProjectJourney } from "@/components/project-journey";
import { readAppConfig } from "@/lib/config/app-config";
import { FileProjectRepository } from "@/lib/projects/file-project-repository";
import { getProjectProgress } from "@/lib/projects/project-progress";
import { projectBriefSchema } from "@/lib/projects/project";
import { storyMoodOptions } from "@/lib/stories/story-mood";
import { storyThemeOptions } from "@/lib/stories/story-theme";

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
                  {age}
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
        <fieldset className="rounded-2xl border border-stone-200 p-4">
          <legend className="px-1 font-semibold">
            How should the story unfold?
          </legend>
          <p className="mt-1 text-sm text-stone-600">
            Choose a familiar story shape, or let the studio decide. Reader age
            and reading mode adjust its complexity and language.
          </p>
          <p className="mt-5 text-sm font-semibold tracking-wide text-stone-700 uppercase">
            Choose a story shape
          </p>
          <div className="mt-3 grid gap-3">
            {[
              {
                value: "mystery_and_reveal",
                title: "Follow clues to solve a mystery",
                example: "Like discovering who entered the Three Bears’ house.",
              },
              {
                value: "mission_with_obstacles",
                title: "Complete a mission with obstacles",
                example:
                  "Like Little Red Riding Hood trying to reach Grandma’s house.",
              },
              {
                value: "try_fail_change_plan",
                title: "Try, fail, then find a better plan",
                example:
                  "Like the Three Little Pigs trying different ways to build a safe home.",
              },
              {
                value: "two_sides_to_understand",
                title: "Understand two points of view",
                example:
                  "Like hearing both Jack’s and the Giant’s sides of the story.",
              },
              {
                value: "feeling_changes_shape",
                title: "Explore a feeling that changes",
                example:
                  "Like the Ugly Duckling moving from loneliness toward belonging.",
              },
            ].map((choice) => (
              <label
                className="flex cursor-pointer gap-3 rounded-xl border border-stone-200 p-4 has-checked:border-stone-950 has-checked:bg-stone-50"
                key={choice.value}
              >
                <input
                  className="mt-1 size-4 shrink-0 accent-stone-950"
                  name="template"
                  type="radio"
                  value={choice.value}
                  defaultChecked={savedBrief?.template === choice.value}
                />
                <span>
                  <span className="block font-semibold">{choice.title}</span>
                  <span className="mt-1 block text-sm text-stone-600">
                    {choice.example}
                  </span>
                </span>
              </label>
            ))}
          </div>
          <p className="mt-5 text-sm font-semibold tracking-wide text-stone-700 uppercase">
            Let the studio decide
          </p>
          <div className="mt-3 grid gap-3">
            <label className="flex cursor-pointer gap-3 rounded-xl border border-stone-200 p-4 has-checked:border-stone-950 has-checked:bg-stone-50">
              <input
                className="mt-1 size-4 shrink-0 accent-stone-950"
                name="template"
                type="radio"
                value="help_me_choose"
                defaultChecked={
                  !savedBrief || savedBrief.template === "help_me_choose"
                }
              />
              <span>
                <span className="block font-semibold">
                  Recommend the best story shape
                </span>
                <span className="mt-1 block text-sm text-stone-600">
                  The studio chooses one of the five shapes above based on your
                  idea.
                </span>
              </span>
            </label>
            <label className="flex cursor-pointer gap-3 rounded-xl border border-stone-200 p-4 has-checked:border-stone-950 has-checked:bg-stone-50">
              <input
                className="mt-1 size-4 shrink-0 accent-stone-950"
                name="template"
                type="radio"
                value="start_from_scratch"
                defaultChecked={savedBrief?.template === "start_from_scratch"}
              />
              <span>
                <span className="block font-semibold">
                  Explore freely without a preset
                </span>
                <span className="mt-1 block text-sm text-stone-600">
                  The studio can create a different kind of story instead of
                  following one of these shapes.
                </span>
              </span>
            </label>
          </div>
        </fieldset>
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
        <fieldset className="rounded-2xl border border-stone-200 p-4">
          <legend className="px-1 font-semibold">
            What mood should the story have?
          </legend>
          <p className="mt-1 text-sm text-stone-600">
            Story shape controls what happens. Mood controls how it is told—its
            tone, pacing, emotional intensity, dialogue, suspense, and ending.
            The studio treats your choice as a required creative direction.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {storyMoodOptions.map((mood) => (
              <label
                className="flex cursor-pointer gap-3 rounded-xl border border-stone-200 p-4 has-checked:border-stone-950 has-checked:bg-stone-50"
                key={mood.value}
              >
                <input
                  className="mt-1 size-4 shrink-0 accent-stone-950"
                  name="storyMood"
                  required
                  type="radio"
                  value={mood.value}
                  defaultChecked={
                    savedBrief?.storyMood === mood.value ||
                    (!savedBrief?.storyMood &&
                      !savedBrief?.desiredFeeling &&
                      mood.value === "no_preference")
                  }
                />
                <span>
                  <span className="block font-semibold">{mood.title}</span>
                  <span className="mt-1 block text-sm text-stone-600">
                    {mood.example}
                  </span>
                </span>
              </label>
            ))}
            <label className="flex cursor-pointer gap-3 rounded-xl border border-stone-200 p-4 has-checked:border-stone-950 has-checked:bg-stone-50 sm:col-span-2">
              <input
                className="mt-1 size-4 shrink-0 accent-stone-950"
                name="storyMood"
                required
                type="radio"
                value="something_else"
                defaultChecked={
                  savedBrief?.storyMood === "something_else" ||
                  (!savedBrief?.storyMood &&
                    Boolean(savedBrief?.desiredFeeling))
                }
              />
              <span className="w-full">
                <span className="block font-semibold">Something else</span>
                <span className="mt-1 block text-sm text-stone-600">
                  Describe the tone or reading experience you want.
                </span>
                <input
                  className="mt-3 block w-full rounded-xl border bg-white p-3 font-normal"
                  aria-label="Describe another story mood"
                  name="customStoryMood"
                  maxLength={300}
                  defaultValue={
                    savedBrief?.customStoryMood ?? savedBrief?.desiredFeeling
                  }
                />
              </span>
            </label>
          </div>
        </fieldset>
        <label className="block font-semibold" htmlFor="mustKeep">
          What important details should the story preserve?
          <span className="mt-1 block text-sm font-normal text-stone-600">
            Optional. Add names, favorite objects, places, character traits,
            family details, or moments that should remain accurate in every
            draft.
          </span>
          <textarea
            className="mt-2 block w-full rounded-xl border p-3"
            id="mustKeep"
            name="mustKeep"
            placeholder="Maya wears purple glasses, her rabbit is named Button, and the story takes place at Grandma’s yellow house."
            defaultValue={savedBrief?.mustKeep}
          />
        </label>
        <fieldset className="rounded-2xl border border-stone-200 p-4">
          <legend className="px-1 font-semibold">
            Is there something you want the story to explore?
          </legend>
          <p className="mt-1 text-sm text-stone-600">
            This shapes what characters experience and learn. The studio must
            show it through their choices and consequences—not state it as a
            lesson.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {storyThemeOptions.map((theme) => (
              <label
                className="flex cursor-pointer gap-3 rounded-xl border border-stone-200 p-4 has-checked:border-stone-950 has-checked:bg-stone-50"
                key={theme.value}
              >
                <input
                  className="mt-1 size-4 shrink-0 accent-stone-950"
                  name="storyTheme"
                  required
                  type="radio"
                  value={theme.value}
                  defaultChecked={
                    savedBrief?.storyTheme === theme.value ||
                    (!savedBrief?.storyTheme &&
                      !savedBrief?.valueOrQuestion &&
                      theme.value === "no_particular_message")
                  }
                />
                <span>
                  <span className="block font-semibold">{theme.title}</span>
                  <span className="mt-1 block text-sm text-stone-600">
                    {theme.example}
                  </span>
                </span>
              </label>
            ))}
            <label className="flex cursor-pointer gap-3 rounded-xl border border-stone-200 p-4 has-checked:border-stone-950 has-checked:bg-stone-50 sm:col-span-2">
              <input
                className="mt-1 size-4 shrink-0 accent-stone-950"
                name="storyTheme"
                required
                type="radio"
                value="something_else"
                defaultChecked={
                  savedBrief?.storyTheme === "something_else" ||
                  (!savedBrief?.storyTheme &&
                    Boolean(savedBrief?.valueOrQuestion))
                }
              />
              <span className="w-full">
                <span className="block font-semibold">Something else</span>
                <span className="mt-1 block text-sm text-stone-600">
                  Describe an idea or question your family wants to explore.
                </span>
                <input
                  className="mt-3 block w-full rounded-xl border bg-white p-3 font-normal"
                  aria-label="Describe another idea to explore"
                  name="customStoryTheme"
                  maxLength={500}
                  defaultValue={
                    savedBrief?.customStoryTheme ?? savedBrief?.valueOrQuestion
                  }
                />
              </span>
            </label>
          </div>
        </fieldset>
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
