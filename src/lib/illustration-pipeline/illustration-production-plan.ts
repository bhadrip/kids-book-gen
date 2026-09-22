import { z } from "zod";

const stableIdSchema = z.string().regex(/^[a-z][a-z0-9_-]*$/);
const sha256Schema = z.string().regex(/^[a-f0-9]{64}$/);
const normalizedNumberSchema = z.number().finite().min(0).max(1);
const pointSchema = z.object({
  x: normalizedNumberSchema,
  y: normalizedNumberSchema,
});

const artifactRevisionSchema = z.object({
  artifactId: stableIdSchema,
  revision: z.number().int().positive(),
  sha256: sha256Schema,
});

const sourceLineageSchema = z.object({
  story: artifactRevisionSchema,
  emotionalArc: artifactRevisionSchema,
  visualBible: artifactRevisionSchema,
  continuityProof: artifactRevisionSchema,
  bookPlan: artifactRevisionSchema,
  textPlacement: artifactRevisionSchema.optional(),
});

const focalRegionSchema = z
  .object({
    id: stableIdSchema,
    x: normalizedNumberSchema,
    y: normalizedNumberSchema,
    width: normalizedNumberSchema.refine((value) => value > 0),
    height: normalizedNumberSchema.refine((value) => value > 0),
  })
  .superRefine((region, context) => {
    if (region.x + region.width > 1 || region.y + region.height > 1) {
      context.addIssue({
        code: "custom",
        message:
          "The focal region must remain inside the normalized page bounds.",
      });
    }
  });

const performanceSchema = z.object({
  actorId: stableIdSchema,
  principal: z.boolean(),
  intensity: z.number().int().min(1).max(8),
  observableSignal: z.string().trim().min(1).max(500),
  prohibitedSignals: z.array(z.string().trim().min(1).max(240)).max(12),
});

const contactSchema = z.object({
  id: stableIdSchema,
  from: stableIdSchema,
  to: stableIdSchema,
  kind: z.enum([
    "grip",
    "ground_support",
    "body_hold",
    "collision",
    "occlusion",
  ]),
});

const flexibleElementSchema = z.object({
  id: stableIdSchema,
  state: z.enum(["taut", "bent", "trailing", "compressed"]),
  fixedAt: stableIdSchema,
  loadedAt: stableIdSchema,
});

const buriedObjectSchema = z.object({
  id: stableIdSchema,
  resistanceAnchor: stableIdSchema,
  minimumBuriedRatio: z.number().min(0.5).max(1),
});

const actionSchema = z
  .object({
    kind: z.enum([
      "static",
      "push",
      "pull",
      "carry",
      "fall",
      "collision",
      "linked_contact",
    ]),
    force: z
      .object({
        from: pointSchema,
        to: pointSchema,
      })
      .optional(),
    resistancePoint: pointSchema.optional(),
    contacts: z.array(contactSchema).max(20),
    flexibleElements: z.array(flexibleElementSchema).max(12),
    buriedObjects: z.array(buriedObjectSchema).max(8),
  })
  .superRefine((action, context) => {
    if (action.kind === "static") return;
    if (!action.force) {
      context.addIssue({
        code: "custom",
        path: ["force"],
        message: "A non-static action must declare its applied force vector.",
      });
    }
    if (!action.resistancePoint) {
      context.addIssue({
        code: "custom",
        path: ["resistancePoint"],
        message: "A non-static action must declare its resistance point.",
      });
    }
    if (action.contacts.length === 0) {
      context.addIssue({
        code: "custom",
        path: ["contacts"],
        message: "A non-static action must declare its contact chain.",
      });
    }
  });

const sourceAssetSchema = z.object({
  assetId: stableIdSchema,
  revision: z.number().int().positive(),
  sha256: sha256Schema,
  path: z.string().trim().min(1).max(500),
});

const generationRequestSchema = z.object({
  requestId: stableIdSchema,
  promptIntent: z.string().trim().min(1).max(2_000),
  referenceAssetIds: z.array(stableIdSchema).min(1).max(12),
  includesTypography: z.literal(false),
});

const productionUnitSchema = z
  .object({
    unitId: stableIdSchema,
    role: z.enum([
      "environment",
      "independent_asset",
      "anchored_prop_plate",
      "interaction_module",
      "foreground_occlusion",
      "integrated_page_exception",
    ]),
    zIndex: z.number().int().min(-100).max(100),
    sourceAsset: sourceAssetSchema.optional(),
    generationRequest: generationRequestSchema.optional(),
    exceptionReason: z.string().trim().min(1).max(1_000).optional(),
  })
  .superRefine((unit, context) => {
    if (Boolean(unit.sourceAsset) === Boolean(unit.generationRequest)) {
      context.addIssue({
        code: "custom",
        message:
          "A production unit must reference one approved asset or one missing-unit generation request.",
      });
    }
    if (unit.role === "integrated_page_exception" && !unit.exceptionReason) {
      context.addIssue({
        code: "custom",
        path: ["exceptionReason"],
        message:
          "An integrated-page exception must explain why layering failed.",
      });
    }
  });

const typographySchema = z.object({
  renderedBy: z.literal("deterministic_layout"),
  treatment: z.enum(["direct_dark", "direct_white", "simple_band"]),
  contrastRatio: z.number().finite().min(4.5),
  cornerRadius: z.number().finite().min(0).max(12),
  safeRegionId: stableIdSchema,
});

const contrastSchema = z.object({
  backgroundTreatment: z.literal("compressed_value_and_chroma"),
  maximumCompetingRegions: z.number().int().min(0).max(2),
  maximumAccentColors: z.number().int().min(0).max(3),
});

const pageSpecSchema = z
  .object({
    pageId: stableIdSchema,
    sequence: z.number().int().positive(),
    storyText: z.string().trim().min(1).max(3_000),
    focalRegion: focalRegionSchema,
    performances: z.array(performanceSchema).max(20),
    action: actionSchema,
    continuityLocks: z.array(z.string().trim().min(1).max(500)).min(1).max(30),
    productionUnits: z.array(productionUnitSchema).min(1).max(50),
    contrast: contrastSchema,
    typography: typographySchema,
  })
  .superRefine((page, context) => {
    const unitIds = new Set<string>();
    for (const [index, unit] of page.productionUnits.entries()) {
      if (unitIds.has(unit.unitId)) {
        context.addIssue({
          code: "custom",
          path: ["productionUnits", index, "unitId"],
          message: `Production unit ${unit.unitId} is duplicated on the page.`,
        });
      }
      unitIds.add(unit.unitId);
    }

    const roles = new Set(page.productionUnits.map((unit) => unit.role));
    const hasIntegratedPage = roles.has("integrated_page_exception");
    const hasIntegratedContact = page.action.contacts.some((contact) =>
      ["grip", "body_hold"].includes(contact.kind),
    );
    if (
      hasIntegratedContact &&
      !hasIntegratedPage &&
      !roles.has("interaction_module")
    ) {
      context.addIssue({
        code: "custom",
        path: ["productionUnits"],
        message:
          "Grip and body-hold contacts require an interaction module or an integrated-page exception.",
      });
    }
    if (
      page.action.buriedObjects.length > 0 &&
      !hasIntegratedPage &&
      !roles.has("anchored_prop_plate")
    ) {
      context.addIssue({
        code: "custom",
        path: ["productionUnits"],
        message:
          "Buried objects must remain in an anchored prop plate or an integrated page.",
      });
    }
  });

export const illustrationProductionPlanInputSchema = z
  .object({
    schemaVersion: z.literal(1),
    bookId: stableIdSchema,
    runId: stableIdSchema,
    createdAt: z.string().datetime(),
    sourceLineage: sourceLineageSchema,
    canvas: z.object({
      width: z.number().int().positive().max(8_192),
      height: z.number().int().positive().max(8_192),
      bleed: z.number().int().nonnegative().max(512),
      safeInset: z.number().int().nonnegative().max(1_024),
    }),
    pages: z.array(pageSpecSchema).min(1).max(64),
  })
  .superRefine((plan, context) => {
    const pageIds = new Set<string>();
    const sequences = new Set<number>();
    for (const [index, page] of plan.pages.entries()) {
      if (pageIds.has(page.pageId)) {
        context.addIssue({
          code: "custom",
          path: ["pages", index, "pageId"],
          message: `Page id ${page.pageId} is duplicated.`,
        });
      }
      if (sequences.has(page.sequence)) {
        context.addIssue({
          code: "custom",
          path: ["pages", index, "sequence"],
          message: `Page sequence ${page.sequence} is duplicated.`,
        });
      }
      pageIds.add(page.pageId);
      sequences.add(page.sequence);
    }

    const sortedSequences = [...sequences].sort((left, right) => left - right);
    for (const [index, sequence] of sortedSequences.entries()) {
      if (sequence !== index + 1) {
        context.addIssue({
          code: "custom",
          path: ["pages"],
          message: "Page sequences must be consecutive and start at 1.",
        });
        break;
      }
    }

    const principalPerformances = plan.pages.flatMap((page) =>
      page.performances.filter((performance) => performance.principal),
    );
    if (principalPerformances.length > 0) {
      const quietCount = principalPerformances.filter(
        ({ intensity }) => intensity >= 2 && intensity <= 5,
      ).length;
      if (quietCount / principalPerformances.length < 0.75) {
        context.addIssue({
          code: "custom",
          path: ["pages"],
          message:
            "At least 75% of principal-character performances must stay within intensity 2–5.",
        });
      }
    }
  });

export type IllustrationProductionPlanInput = z.input<
  typeof illustrationProductionPlanInputSchema
>;

export type IllustrationProductionStrategy =
  "layered" | "hybrid" | "integrated_page_exception";

export type CompiledIllustrationPagePlan = {
  schemaVersion: 1;
  bookId: string;
  runId: string;
  pageId: string;
  sequence: number;
  canvas: z.output<typeof illustrationProductionPlanInputSchema>["canvas"];
  storyText: string;
  action: z.output<typeof actionSchema>;
  continuityLocks: string[];
  productionUnits: z.output<typeof productionUnitSchema>[];
  contrast: z.output<typeof contrastSchema>;
  typography: z.output<typeof typographySchema>;
  strategy: IllustrationProductionStrategy;
  requiresPhysicsProof: boolean;
  focalRegion: z.output<typeof focalRegionSchema>;
  performanceIntensities: Record<string, number>;
  orderedUnitIds: string[];
  generationQueue: string[];
  stages: string[];
  hardGates: string[];
};

export type CompiledIllustrationProductionPlan = {
  schemaVersion: 1;
  bookId: string;
  runId: string;
  createdAt: string;
  sourceLineage: z.output<typeof sourceLineageSchema>;
  canvas: z.output<typeof illustrationProductionPlanInputSchema>["canvas"];
  executionPolicy: {
    generationMode: "sequential_one_missing_unit";
    typographyMode: "deterministic_after_art";
    rasterApprovalMode: "visual_review_required";
    pageRevisionMode: "smallest_failing_unit";
  };
  pages: CompiledIllustrationPagePlan[];
  finalReviewHandoffs: string[];
};

function requiresPhysicsProof(action: z.output<typeof actionSchema>): boolean {
  return (
    action.buriedObjects.length > 0 ||
    action.flexibleElements.length > 0 ||
    action.contacts.length >= 3
  );
}

function productionStrategy(
  units: z.output<typeof productionUnitSchema>[],
): IllustrationProductionStrategy {
  const roles = new Set(units.map((unit) => unit.role));
  if (roles.has("integrated_page_exception")) {
    return "integrated_page_exception";
  }
  if (
    roles.has("anchored_prop_plate") ||
    roles.has("interaction_module") ||
    roles.has("foreground_occlusion")
  ) {
    return "hybrid";
  }
  return "layered";
}

export function compileIllustrationProductionPlan(
  input: IllustrationProductionPlanInput,
): CompiledIllustrationProductionPlan {
  const plan = illustrationProductionPlanInputSchema.parse(input);
  const pages = [...plan.pages]
    .sort((left, right) => left.sequence - right.sequence)
    .map((page): CompiledIllustrationPagePlan => {
      const physicsRequired = requiresPhysicsProof(page.action);
      const generationQueue = page.productionUnits
        .filter((unit) => unit.generationRequest)
        .sort((left, right) => left.zIndex - right.zIndex)
        .map((unit) => unit.unitId);
      const stages = ["validate_lineage", "resolve_coordinates"];
      if (physicsRequired) stages.push("build_rapier_pose_proof");
      stages.push("reuse_approved_assets");
      if (generationQueue.length > 0) {
        stages.push("generate_one_missing_unit_at_a_time");
      }
      stages.push(
        "compose_explicit_z_order",
        "render_page",
        "inspect_rendered_interactions",
        "compose_deterministic_typography",
        "validate_page",
      );

      const hardGates = [
        "identity_and_lineage",
        "contact_and_occlusion",
        "single_focal_hierarchy",
        "performance_intensity",
        "typography_readability",
        "continuity_locks",
      ];
      if (page.action.kind !== "static") hardGates.push("force_chain");
      if (physicsRequired)
        hardGates.push("rapier_proof_then_raster_comparison");

      return {
        schemaVersion: 1,
        bookId: plan.bookId,
        runId: plan.runId,
        pageId: page.pageId,
        sequence: page.sequence,
        canvas: plan.canvas,
        storyText: page.storyText,
        action: page.action,
        continuityLocks: page.continuityLocks,
        productionUnits: page.productionUnits,
        contrast: page.contrast,
        typography: page.typography,
        strategy: productionStrategy(page.productionUnits),
        requiresPhysicsProof: physicsRequired,
        focalRegion: page.focalRegion,
        performanceIntensities: Object.fromEntries(
          page.performances.map((performance) => [
            performance.actorId,
            performance.intensity,
          ]),
        ),
        orderedUnitIds: [...page.productionUnits]
          .sort((left, right) => left.zIndex - right.zIndex)
          .map((unit) => unit.unitId),
        generationQueue,
        stages,
        hardGates,
      };
    });

  return {
    schemaVersion: 1,
    bookId: plan.bookId,
    runId: plan.runId,
    createdAt: plan.createdAt,
    sourceLineage: plan.sourceLineage,
    canvas: plan.canvas,
    executionPolicy: {
      generationMode: "sequential_one_missing_unit",
      typographyMode: "deterministic_after_art",
      rasterApprovalMode: "visual_review_required",
      pageRevisionMode: "smallest_failing_unit",
    },
    pages,
    finalReviewHandoffs: [
      "text_placement",
      "character_continuity",
      "emotional_arc",
      "environment_and_prop_continuity",
      "text_image_production",
    ],
  };
}
