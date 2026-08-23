import { z } from "zod";

export const readingModeSchema = z.enum([
  "parent_read_aloud",
  "co_read",
  "independent_developing",
  "independent_confident",
]);

export const readerConfigurationSchema = z.object({
  age: z.coerce
    .number()
    .int()
    .min(3, "Choose an age from 3 through 10.")
    .max(10, "Choose an age from 3 through 10."),
  readingMode: readingModeSchema,
  profileVersion: z.literal("reader-profiles-v1").default("reader-profiles-v1"),
});

export type ReaderConfiguration = z.infer<typeof readerConfigurationSchema>;

export function readerAgeBand(age: number) {
  if (age <= 5) return "ages 3–5";
  if (age <= 7) return "ages 6–7";
  return "ages 8–10";
}

const modeLabels: Record<ReaderConfiguration["readingMode"], string> = {
  parent_read_aloud: "with an adult reading aloud",
  co_read: "by reading together",
  independent_developing: "as a developing independent reader",
  independent_confident: "as a confident independent reader",
};

export function readerConfigurationSummary(reader: ReaderConfiguration) {
  return `Written for age ${reader.age} (${readerAgeBand(reader.age)}) to enjoy ${modeLabels[reader.readingMode]}.`;
}

export function readerProfileGuidance(reader: ReaderConfiguration) {
  const ageGuidance =
    reader.age <= 5
      ? "Use an immediate concrete goal, visible cause and effect, strongly supported chronology and motives, few simultaneous characters or locations, meaningful pattern and repetition, short conversational turns, readable emotional changes, and reassuring closure proportionate to the story's intensity."
      : reader.age <= 7
        ? "Use a clear goal and motivation, modest supported inference, somewhat longer causal chains, varied but manageable syntax and vocabulary, and attempts that meaningfully change the situation."
        : "Allow layered causal chains, delayed payoff, supported inference, competing perspectives, richer vocabulary and syntax, meaningful agency, changed attempts, and an earned payoff without omitting causal facts.";

  const modeGuidance: Record<ReaderConfiguration["readingMode"], string> = {
    parent_read_aloud:
      "Prioritize oral flow, listening comprehension, dialogue clarity, supported rich vocabulary, and shared prediction or discussion. Do not constrain language to independent decoding ability.",
    co_read:
      "Prioritize oral flow and listening comprehension while adding approachable participation lines, repeated language, and natural places for the child to join.",
    independent_developing:
      "Prioritize manageable decoding load, sentence cohesion, explicit referents, controlled text density, and strong support for inference; keep rich words recoverable from context.",
    independent_confident:
      "Allow greater syntactic and vocabulary complexity while preserving coherent causal structure, clear knowledge states, and supported inference.",
  };

  return `${readerConfigurationSummary(reader)} ${ageGuidance} ${modeGuidance[reader.readingMode]}`;
}
