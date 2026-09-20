import { describe, expect, it } from "vitest";

import {
  storyDirectionsSchema,
  storyPackageSchema,
} from "@/lib/projects/project";

describe("storyDirectionsSchema", () => {
  it("requires exactly three structured directions", () => {
    const direction = {
      title: "A moonlit mission",
      storyEngine: "mission with obstacles",
      promise: "A child returns a moon kite before dawn.",
      opening: "The moon kite slips from its string.",
      ending: "It shines over the whole neighborhood again.",
    };

    expect(() =>
      storyDirectionsSchema.parse({
        schemaVersion: 1,
        projectId: "4a2b8437-2e5d-492d-885b-4f1052d4da88",
        sourceBriefCreatedAt: "2026-07-20T12:00:00.000Z",
        generatedAt: "2026-07-20T12:01:00.000Z",
        model: "fixture-model",
        directions: [direction, direction],
      }),
    ).toThrow();
  });
});

describe("storyPackageSchema", () => {
  const storyWith = (count: number) => ({
    schemaVersion: 1,
    projectId: "4a2b8437-2e5d-492d-885b-4f1052d4da88",
    generatedAt: "2026-09-18T12:00:00.000Z",
    model: "fixture-model",
    revision: 1,
    sourceDirectionTitle: "Small steps",
    title: "A flexible story",
    characters: [{ name: "Nila", role: "protagonist", description: "A child" }],
    promise: "A child finds a small way forward.",
    arc: { beginning: "A pause", middle: "Small tries", ending: "A choice" },
    spreads: Array.from({ length: count }, (_, index) => ({
      number: index + 1,
      beat: `Beat ${index + 1}`,
      text: `Text ${index + 1}`,
    })),
  });

  it.each([12, 13, 14])(
    "accepts %i consecutively numbered spreads",
    (count) => {
      expect(() => storyPackageSchema.parse(storyWith(count))).not.toThrow();
    },
  );

  it.each([11, 15])("rejects %i spreads", (count) => {
    expect(() => storyPackageSchema.parse(storyWith(count))).toThrow();
  });

  it("rejects a numbering gap", () => {
    const story = storyWith(12);
    story.spreads[6].number = 8;
    expect(() => storyPackageSchema.parse(story)).toThrow();
  });
});
