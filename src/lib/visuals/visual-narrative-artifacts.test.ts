import { describe, expect, it } from "vitest";

import {
  spreadMapSchema,
  visualPlanDraftSchema,
} from "@/lib/visuals/visual-narrative-artifacts";

const spreadsWith = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    spreadNumber: index + 1,
    storyBeat: `Beat ${index + 1}`,
    storyJob: "Move the same story forward.",
    mainAction: "The protagonist makes a visible choice.",
    emotionalMovement: "Uncertain to more settled.",
    illustrationIntent: "Show the action clearly.",
    mustShow: [],
    mustAvoid: [],
    pageTurnQuestion: "What happens next?",
  }));

const mapWith = (count: number) => ({
  schemaVersion: 1,
  projectId: "4a2b8437-2e5d-492d-885b-4f1052d4da88",
  revision: 1,
  sourceStoryRevision: 1,
  sourceEmotionalArcRevision: 1,
  generatedAt: "2026-09-18T12:00:00.000Z",
  model: "fixture-model",
  spreads: spreadsWith(count),
});

const draftWith = (count: number) => ({
  emotionalArc: {
    characters: [
      {
        characterName: "Nila",
        beats: [
          {
            spreadNumber: 1,
            enteringState: "playful",
            trigger: "Bath time begins.",
            outwardExpression: "Nila pauses and looks toward the bath.",
            leavingState: "uncertain",
            intensity: "low",
            avoidSignals: [],
          },
        ],
      },
    ],
  },
  spreadMap: { spreads: spreadsWith(count) },
});

describe("flexible spread-map schemas", () => {
  it.each([12, 13, 14])("accepts %i ordered spreads", (count) => {
    expect(() => spreadMapSchema.parse(mapWith(count))).not.toThrow();
    expect(() => visualPlanDraftSchema.parse(draftWith(count))).not.toThrow();
  });

  it.each([11, 15])("rejects %i spreads", (count) => {
    expect(() => spreadMapSchema.parse(mapWith(count))).toThrow();
    expect(() => visualPlanDraftSchema.parse(draftWith(count))).toThrow();
  });

  it("rejects a numbering gap", () => {
    const map = mapWith(12);
    map.spreads[4].spreadNumber = 6;
    expect(() => spreadMapSchema.parse(map)).toThrow();

    const draft = draftWith(12);
    draft.spreadMap.spreads[4].spreadNumber = 6;
    expect(() => visualPlanDraftSchema.parse(draft)).toThrow();
  });
});
