import { z } from "zod";

const normalizedPointSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
});

const pagePointSchema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
});

export const characterPullRigSchema = z.object({
  id: z.string().min(1),
  asset: z.object({
    source: z.string().min(1),
    width: z.number().positive(),
    height: z.number().positive(),
  }),
  landmarks: z.object({
    head: normalizedPointSchema,
    shoulder: normalizedPointSchema,
    hip: normalizedPointSchema,
    leftFoot: normalizedPointSchema,
    rightFoot: normalizedPointSchema,
    leftHand: normalizedPointSchema,
    rightHand: normalizedPointSchema,
  }),
});

export const pullPageSpecSchema = z.object({
  id: z.string().min(1),
  page: z.object({
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    pixelsPerWorldUnit: z.number().positive(),
  }),
  characterPlacement: z.object({
    left: z.number().finite(),
    top: z.number().finite(),
    width: z.number().positive(),
  }),
  sceneAnchors: z.object({
    soilY: z.number().finite(),
    crown: pagePointSchema,
  }),
  action: z.object({
    type: z.literal("pull-rooted-plant"),
    leafTopLength: z.number().positive(),
    turnipRadiusX: z.number().positive(),
    turnipRadiusY: z.number().positive(),
    minimumBuriedRatio: z.number().min(0).max(1),
    maximumStalkAlignmentDegrees: z.number().min(0).max(90),
    minimumCounterbalance: z.number().nonnegative(),
    performanceIntensity: z.number().int().min(1).max(10),
  }),
});

export type CharacterPullRig = z.infer<typeof characterPullRigSchema>;
export type PullPageSpec = z.infer<typeof pullPageSpecSchema>;

export type CompiledPullScene = {
  schemaVersion: 1;
  source: {
    rigId: string;
    pageSpecId: string;
  };
  page: PullPageSpec["page"];
  characterPlacement: PullPageSpec["characterPlacement"] & {
    height: number;
  };
  pageCoordinates: {
    head: z.infer<typeof pagePointSchema>;
    shoulder: z.infer<typeof pagePointSchema>;
    hip: z.infer<typeof pagePointSchema>;
    feet: [z.infer<typeof pagePointSchema>, z.infer<typeof pagePointSchema>];
    hands: [z.infer<typeof pagePointSchema>, z.infer<typeof pagePointSchema>];
    grip: z.infer<typeof pagePointSchema>;
    crown: z.infer<typeof pagePointSchema>;
    leafTips: [
      z.infer<typeof pagePointSchema>,
      z.infer<typeof pagePointSchema>,
      z.infer<typeof pagePointSchema>,
    ];
    soilY: number;
  };
  rapierInput: {
    soilY: number;
    turnip: {
      center: z.infer<typeof pagePointSchema>;
      radiusX: number;
      radiusY: number;
      crown: z.infer<typeof pagePointSchema>;
    };
    actor: {
      id: string;
      label: string;
      color: string;
      head: z.infer<typeof pagePointSchema>;
      shoulder: z.infer<typeof pagePointSchema>;
      hip: z.infer<typeof pagePointSchema>;
      feet: [z.infer<typeof pagePointSchema>, z.infer<typeof pagePointSchema>];
      grips: [z.infer<typeof pagePointSchema>, z.infer<typeof pagePointSchema>];
    };
    grip: z.infer<typeof pagePointSchema>;
    leafTips: [
      z.infer<typeof pagePointSchema>,
      z.infer<typeof pagePointSchema>,
      z.infer<typeof pagePointSchema>,
    ];
    thresholds: {
      minimumBuriedRatio: number;
      maximumStalkAlignmentDegrees: number;
      minimumCounterbalance: number;
      minimumLeafTipProjection: number;
    };
  };
  production: {
    focalRegion: "hands-stalks-crown";
    performanceIntensity: number;
    plantTopology: "crown-to-stalk-to-grip-to-leafy-tip";
  };
};

function rounded(value: number, digits = 4): number {
  return Number(value.toFixed(digits));
}

function averagePoint(
  a: z.infer<typeof pagePointSchema>,
  b: z.infer<typeof pagePointSchema>,
): z.infer<typeof pagePointSchema> {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function compilePullScene(
  rigInput: CharacterPullRig,
  pageSpecInput: PullPageSpec,
): CompiledPullScene {
  const rig = characterPullRigSchema.parse(rigInput);
  const spec = pullPageSpecSchema.parse(pageSpecInput);
  const placementHeight =
    spec.characterPlacement.width * (rig.asset.height / rig.asset.width);

  const toPage = (
    point: z.infer<typeof normalizedPointSchema>,
  ): z.infer<typeof pagePointSchema> => ({
    x: rounded(
      spec.characterPlacement.left + point.x * spec.characterPlacement.width,
    ),
    y: rounded(spec.characterPlacement.top + point.y * placementHeight),
  });

  const hands = [
    toPage(rig.landmarks.leftHand),
    toPage(rig.landmarks.rightHand),
  ] as const;
  const grip = averagePoint(hands[0], hands[1]);
  const crown = spec.sceneAnchors.crown;
  const pullX = grip.x - crown.x;
  const pullY = grip.y - crown.y;
  const pullLength = Math.hypot(pullX, pullY);
  if (pullLength === 0) {
    throw new Error(
      "The grip and crown anchors must not occupy the same point.",
    );
  }
  const unitX = pullX / pullLength;
  const unitY = pullY / pullLength;
  const normalX = -unitY;
  const normalY = unitX;
  const leafTips = [
    { length: 0.86, fan: -0.24 },
    { length: 1, fan: 0 },
    { length: 0.9, fan: 0.27 },
  ].map(({ length, fan }) => ({
    x: rounded(
      grip.x +
        unitX * spec.action.leafTopLength * length +
        normalX * spec.action.leafTopLength * fan,
    ),
    y: rounded(
      grip.y +
        unitY * spec.action.leafTopLength * length +
        normalY * spec.action.leafTopLength * fan,
    ),
  })) as CompiledPullScene["pageCoordinates"]["leafTips"];

  const toWorld = (
    point: z.infer<typeof pagePointSchema>,
  ): z.infer<typeof pagePointSchema> => ({
    x: rounded(point.x / spec.page.pixelsPerWorldUnit),
    y: rounded(
      (spec.sceneAnchors.soilY - point.y) / spec.page.pixelsPerWorldUnit,
    ),
  });
  const radiusX = rounded(
    spec.action.turnipRadiusX / spec.page.pixelsPerWorldUnit,
  );
  const radiusY = rounded(
    spec.action.turnipRadiusY / spec.page.pixelsPerWorldUnit,
  );
  const crownWorld = toWorld(crown);
  const feet = [
    toPage(rig.landmarks.leftFoot),
    toPage(rig.landmarks.rightFoot),
  ] as const;

  return {
    schemaVersion: 1,
    source: { rigId: rig.id, pageSpecId: spec.id },
    page: spec.page,
    characterPlacement: {
      ...spec.characterPlacement,
      height: rounded(placementHeight),
    },
    pageCoordinates: {
      head: toPage(rig.landmarks.head),
      shoulder: toPage(rig.landmarks.shoulder),
      hip: toPage(rig.landmarks.hip),
      feet: [feet[0], feet[1]],
      hands: [hands[0], hands[1]],
      grip: { x: rounded(grip.x), y: rounded(grip.y) },
      crown,
      leafTips,
      soilY: spec.sceneAnchors.soilY,
    },
    rapierInput: {
      soilY: 0,
      turnip: {
        center: {
          x: crownWorld.x,
          y: rounded(crownWorld.y - radiusY),
        },
        radiusX,
        radiusY,
        crown: crownWorld,
      },
      actor: {
        id: rig.id,
        label: "Mae",
        color: "#70918a",
        head: toWorld(toPage(rig.landmarks.head)),
        shoulder: toWorld(toPage(rig.landmarks.shoulder)),
        hip: toWorld(toPage(rig.landmarks.hip)),
        feet: [toWorld(feet[0]), toWorld(feet[1])],
        grips: [toWorld(hands[0]), toWorld(hands[1])],
      },
      grip: toWorld(grip),
      leafTips: leafTips.map(
        toWorld,
      ) as CompiledPullScene["rapierInput"]["leafTips"],
      thresholds: {
        minimumBuriedRatio: spec.action.minimumBuriedRatio,
        maximumStalkAlignmentDegrees: spec.action.maximumStalkAlignmentDegrees,
        minimumCounterbalance: spec.action.minimumCounterbalance,
        minimumLeafTipProjection: rounded(
          (spec.action.leafTopLength * 0.8) / spec.page.pixelsPerWorldUnit,
        ),
      },
    },
    production: {
      focalRegion: "hands-stalks-crown",
      performanceIntensity: spec.action.performanceIntensity,
      plantTopology: "crown-to-stalk-to-grip-to-leafy-tip",
    },
  };
}
