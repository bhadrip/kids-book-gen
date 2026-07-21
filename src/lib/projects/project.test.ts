import { describe, expect, it } from "vitest";

import {
  storyDirectionsSchema,
  storyEvaluationSchema,
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

describe("storyEvaluationSchema", () => {
  it("requires the overall outcome to reflect the five hidden dimensions", () => {
    const passingDimension = {
      outcome: "pass",
      evidence: ["The story provides artifact-level evidence."],
    };

    expect(() =>
      storyEvaluationSchema.parse({
        schemaVersion: 1,
        projectId: "4a2b8437-2e5d-492d-885b-4f1052d4da88",
        storyRevision: 1,
        evaluatedAt: "2026-07-20T12:01:00.000Z",
        model: "fixture-model",
        outcome: "pass",
        dimensions: {
          ideaFidelity: passingDimension,
          causalStructure: {
            outcome: "revision_required",
            evidence: ["The ending is not caused by the protagonist's choice."],
            revisionInstruction:
              "Make the protagonist's choice cause the resolution.",
          },
          ageFit: passingDimension,
          oralFlow: passingDimension,
          safety: passingDimension,
        },
        preserve: ["The parent's must-keep detail"],
        revisionInstructions: [],
      }),
    ).toThrow("Evaluation outcome must reflect its dimension outcomes");
  });
});
