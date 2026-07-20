import { describe, expect, it } from "vitest";

import { storyDirectionsSchema } from "@/lib/projects/project";

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
