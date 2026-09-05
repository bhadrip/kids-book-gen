import type { ProjectBrief } from "@/lib/projects/project";

export const storyThemeOptions = [
  {
    value: "asking_for_help",
    title: "Asking for help",
    example:
      "A character discovers that accepting support can change the outcome.",
    guidance:
      "Let the protagonist meaningfully try, recognize a limit, choose to ask for help, and participate in the shared solution.",
  },
  {
    value: "brave_while_scared",
    title: "Being brave while feeling scared",
    example:
      "Courage appears through action even though fear does not instantly disappear.",
    guidance:
      "Show courage as a consequential choice made while fear is still present; do not define bravery as never feeling afraid.",
  },
  {
    value: "repairing_friendship",
    title: "Repairing a friendship after a mistake",
    example:
      "A character recognizes harm and takes specific steps to repair it.",
    guidance:
      "Show recognition, a meaningful response or apology, concrete repair, and trust rebuilding through action rather than instant forgiveness.",
  },
  {
    value: "including_someone",
    title: "Including someone who feels left out",
    example:
      "Characters notice exclusion and make belonging possible without treating anyone as a project.",
    guidance:
      "Show characters noticing exclusion, listening, and changing the situation while preserving the excluded character's agency and dignity.",
  },
  {
    value: "handling_disappointment",
    title: "Handling disappointment",
    example:
      "A hoped-for result changes, but the character finds a constructive next step.",
    guidance:
      "Allow disappointment to be real, then show the protagonist responding constructively without pretending the original loss did not matter.",
  },
  {
    value: "understanding_viewpoint",
    title: "Understanding another point of view",
    example:
      "New information helps characters understand why they saw the same situation differently.",
    guidance:
      "Reveal understandable perspectives through evidence and character interaction; do not force agreement or declare one person morally superior by narration alone.",
  },
  {
    value: "no_particular_message",
    title: "No particular message",
    example: "Let meaning emerge naturally from the adventure.",
    guidance:
      "Do not impose a lesson. Let any meaning emerge naturally from character choices, consequences, and resolution.",
  },
] as const;

export function storyThemeInstruction(
  brief: Pick<
    ProjectBrief,
    "storyTheme" | "customStoryTheme" | "valueOrQuestion"
  >,
) {
  if (brief.storyTheme === "something_else")
    return `Required parent-selected idea to explore: ${brief.customStoryTheme}. Express it through conflict, character choices, consequences, recognition, and resolution—not through a narrator lecture, slogan, or pasted-on moral.`;

  const option = storyThemeOptions.find(
    (candidate) => candidate.value === brief.storyTheme,
  );
  if (option)
    return `Required parent-selected idea to explore: ${option.title}. ${option.guidance} Express it through story action and consequences, not a stated lesson.`;

  if (brief.valueOrQuestion)
    return `Required legacy parent-selected value or question: ${brief.valueOrQuestion}. Express it through conflict, choices, consequences, and resolution—not a narrator lecture or pasted-on moral.`;

  return "No parent-selected message was recorded for this legacy brief. Do not impose a lesson; let meaning emerge naturally from the story.";
}
