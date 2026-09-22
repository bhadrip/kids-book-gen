import { describe, expect, it } from "vitest";

import {
  compileIllustrationProductionPlan,
  illustrationProductionPlanInputSchema,
  type IllustrationProductionPlanInput,
} from "@/lib/illustration-pipeline/illustration-production-plan";

const hash = "a".repeat(64);

function source(artifactId: string) {
  return { artifactId, revision: 1, sha256: hash };
}

function page(
  sequence: number,
  intensity: number,
): IllustrationProductionPlanInput["pages"][number] {
  return {
    pageId: `page-${sequence}`,
    sequence,
    storyText: "A small, deterministic line of story text.",
    focalRegion: {
      id: "main-action",
      x: 0.4,
      y: 0.3,
      width: 0.4,
      height: 0.4,
    },
    performances: [
      {
        actorId: "mae",
        principal: true,
        intensity,
        observableSignal: "Focused gaze and a grounded stance.",
        prohibitedSignals: ["huge eyes", "open-mouth scream"],
      },
    ],
    action: {
      kind: "static",
      contacts: [],
      flexibleElements: [],
      buriedObjects: [],
    },
    continuityLocks: ["Mae keeps the approved clothing and proportions."],
    productionUnits: [
      {
        unitId: "garden",
        role: "environment",
        zIndex: 0,
        sourceAsset: {
          assetId: "garden-v1",
          revision: 1,
          sha256: hash,
          path: "assets/garden.png",
        },
      },
    ],
    contrast: {
      backgroundTreatment: "compressed_value_and_chroma",
      maximumCompetingRegions: 1,
      maximumAccentColors: 2,
    },
    typography: {
      renderedBy: "deterministic_layout",
      treatment: "direct_white",
      contrastRatio: 5.1,
      cornerRadius: 0,
      safeRegionId: "upper-left",
    },
  };
}

function plan(): IllustrationProductionPlanInput {
  return {
    schemaVersion: 1,
    bookId: "sample-book",
    runId: "sample-run-1",
    createdAt: "2026-09-22T12:00:00.000Z",
    sourceLineage: {
      story: source("story"),
      emotionalArc: source("emotional-arc"),
      visualBible: source("visual-bible"),
      continuityProof: source("continuity-proof"),
      bookPlan: source("book-plan"),
      textPlacement: source("text-placement"),
    },
    canvas: { width: 1536, height: 1024, bleed: 0, safeInset: 72 },
    pages: [page(1, 3), page(2, 4), page(3, 5), page(4, 7)],
  };
}

describe("illustration production plan", () => {
  it("compiles approved inputs into ordered page work with deterministic text", () => {
    const compiled = compileIllustrationProductionPlan(plan());

    expect(compiled.pages.map(({ pageId }) => pageId)).toEqual([
      "page-1",
      "page-2",
      "page-3",
      "page-4",
    ]);
    expect(compiled.executionPolicy).toEqual({
      generationMode: "sequential_one_missing_unit",
      typographyMode: "deterministic_after_art",
      rasterApprovalMode: "visual_review_required",
      pageRevisionMode: "smallest_failing_unit",
    });
    expect(compiled.pages[0]?.stages).not.toContain("build_rapier_pose_proof");
  });

  it("requires Rapier and hybrid composition for buried flexible pull actions", () => {
    const input = plan();
    input.pages[0] = {
      ...page(1, 3),
      action: {
        kind: "pull",
        force: { from: { x: 0.8, y: 0.8 }, to: { x: 0.3, y: 0.4 } },
        resistancePoint: { x: 0.8, y: 0.85 },
        contacts: [
          { id: "two-hand-grip", from: "mae", to: "stalks", kind: "grip" },
        ],
        flexibleElements: [
          {
            id: "stalks",
            state: "taut",
            fixedAt: "turnip-crown",
            loadedAt: "two-hand-grip",
          },
        ],
        buriedObjects: [
          {
            id: "turnip",
            resistanceAnchor: "soil",
            minimumBuriedRatio: 0.9,
          },
        ],
      },
      productionUnits: [
        ...page(1, 3).productionUnits,
        {
          unitId: "buried-turnip-plate",
          role: "anchored_prop_plate",
          zIndex: 10,
          sourceAsset: {
            assetId: "turnip-plate-v1",
            revision: 1,
            sha256: hash,
            path: "assets/turnip-plate.png",
          },
        },
        {
          unitId: "mae-grip-module",
          role: "interaction_module",
          zIndex: 20,
          generationRequest: {
            requestId: "generate-mae-grip",
            promptIntent:
              "Preserve Mae while integrating both hands and stalks.",
            referenceAssetIds: ["mae-reference", "turnip-plate-v1"],
            includesTypography: false,
          },
        },
      ],
    };

    const compiled = compileIllustrationProductionPlan(input);
    expect(compiled.pages[0]).toMatchObject({
      strategy: "hybrid",
      requiresPhysicsProof: true,
      generationQueue: ["mae-grip-module"],
    });
    expect(compiled.pages[0]?.stages).toContain("build_rapier_pose_proof");
    expect(compiled.pages[0]?.hardGates).toContain(
      "rapier_proof_then_raster_comparison",
    );
  });

  it("rejects pasted-on grips and independently floating buried props", () => {
    const input = plan();
    input.pages[0] = {
      ...page(1, 3),
      action: {
        kind: "pull",
        force: { from: { x: 0.8, y: 0.8 }, to: { x: 0.3, y: 0.4 } },
        resistancePoint: { x: 0.8, y: 0.85 },
        contacts: [{ id: "grip", from: "mae", to: "stalks", kind: "grip" }],
        flexibleElements: [],
        buriedObjects: [
          {
            id: "turnip",
            resistanceAnchor: "soil",
            minimumBuriedRatio: 0.9,
          },
        ],
      },
    };

    const result = illustrationProductionPlanInputSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map(({ message }) => message);
      expect(messages).toContain(
        "Grip and body-hold contacts require an interaction module or an integrated-page exception.",
      );
      expect(messages).toContain(
        "Buried objects must remain in an anchored prop plate or an integrated page.",
      );
    }
  });

  it("rejects a book whose principal performances are mostly overplayed", () => {
    const input = plan();
    input.pages = [page(1, 7), page(2, 7), page(3, 7), page(4, 4)];

    expect(() => compileIllustrationProductionPlan(input)).toThrow(
      "At least 75% of principal-character performances must stay within intensity 2–5.",
    );
  });

  it("rejects model-rendered typography and low-contrast text", () => {
    const input = plan();
    input.pages[0] = {
      ...page(1, 3),
      typography: {
        renderedBy: "image_model" as "deterministic_layout",
        treatment: "direct_white",
        contrastRatio: 3.2,
        cornerRadius: 0,
        safeRegionId: "upper-left",
      },
    };

    expect(illustrationProductionPlanInputSchema.safeParse(input).success).toBe(
      false,
    );
  });
});
