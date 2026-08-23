import type { ProjectBrief } from "@/lib/projects/project";

export const storyMoodOptions = [
  {
    value: "warm_cozy",
    title: "Warm and cozy",
    example: "Comforting moments, gentle tension, and a reassuring ending.",
    guidance:
      "Use a warm, intimate tone, gentle pacing, low-to-moderate tension, affectionate details, and reassuring closure.",
  },
  {
    value: "funny_playful",
    title: "Funny and playful",
    example: "Silly surprises, lively dialogue, and lighthearted trouble.",
    guidance:
      "Use playful language, comic complications, lively dialogue, light tension, and a satisfying humorous payoff.",
  },
  {
    value: "exciting_adventurous",
    title: "Exciting and adventurous",
    example: "Bold challenges, quick momentum, and an earned victory.",
    guidance:
      "Use energetic pacing, meaningful obstacles, age-profile-appropriate suspense, bold action, and an earned release of tension.",
  },
  {
    value: "gentle_comforting",
    title: "Gentle and comforting",
    example: "Small worries, dependable support, and visible safety.",
    guidance:
      "Keep danger and conflict low-intensity, make support and safety legible, use calm language, and provide dependable emotional reassurance.",
  },
  {
    value: "curious_mysterious",
    title: "Curious and mysterious",
    example: "Interesting clues, anticipation, and a satisfying discovery.",
    guidance:
      "Build curiosity through supported clues, anticipation, prediction, and discovery without exceeding the reader profile's inference or fear tolerance.",
  },
  {
    value: "thoughtful_hopeful",
    title: "Thoughtful and hopeful",
    example: "Meaningful choices, quieter reflection, and hopeful change.",
    guidance:
      "Use reflective pacing, emotionally meaningful choices, room for thought, and a hopeful but earned resolution rather than a lecture.",
  },
  {
    value: "no_preference",
    title: "No preference",
    example: "Let the studio choose a mood that fits the idea.",
    guidance:
      "Choose a coherent mood that best serves the family idea, story shape, and reader profile, then sustain it intentionally.",
  },
] as const;

export type StoryMood =
  (typeof storyMoodOptions)[number]["value"] | "something_else";

export function storyMoodInstruction(
  brief: Pick<ProjectBrief, "storyMood" | "customStoryMood" | "desiredFeeling">,
) {
  if (brief.storyMood === "something_else") {
    return `Required parent-selected mood: ${brief.customStoryMood}. Apply it materially to tone, pacing, emotional intensity, dialogue, suspense, and closure. Do not replace it with a generic warm tone.`;
  }

  const option = storyMoodOptions.find(
    (candidate) => candidate.value === brief.storyMood,
  );
  if (option)
    return `Required parent-selected mood: ${option.title}. ${option.guidance}`;

  if (brief.desiredFeeling)
    return `Required legacy parent mood request: ${brief.desiredFeeling}. Apply it materially to tone, pacing, emotional intensity, dialogue, suspense, and closure.`;

  return "No parent mood was recorded for this legacy brief. Choose and sustain a coherent mood that fits the idea, story shape, and reader profile.";
}
