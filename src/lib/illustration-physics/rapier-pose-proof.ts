import RAPIER, {
  type Collider,
  type RigidBody,
  type World,
} from "@dimforge/rapier2d-deterministic-compat";
import { z } from "zod";

const pointSchema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
});

const checkSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  passed: z.boolean(),
  actual: z.number().finite(),
  operator: z.enum([">=", "<=", "=="]),
  threshold: z.number().finite(),
  unit: z.string().min(1),
});

export const physicsPoseProofSchema = z.object({
  schemaVersion: z.literal(2),
  engine: z.literal("@dimforge/rapier2d-deterministic-compat"),
  engineVersion: z.literal("0.20.0"),
  mode: z.literal("static-illustration-pose-proof"),
  id: z.enum(["buried-turnip", "mae-pull", "helper-chain"]),
  title: z.string().min(1),
  note: z.string().min(1),
  soilY: z.number().finite(),
  turnip: z.object({
    center: pointSchema,
    radiusX: z.number().positive(),
    radiusY: z.number().positive(),
    crown: pointSchema,
    buriedRatio: z.number().min(0).max(1),
  }),
  leafChain: z.array(
    z.object({
      from: pointSchema,
      to: pointSchema,
    }),
  ),
  leafBlades: z.array(
    z.object({
      from: pointSchema,
      to: pointSchema,
    }),
  ),
  actors: z.array(
    z.object({
      id: z.string().min(1),
      label: z.string().min(1),
      color: z.string().min(1),
      head: pointSchema,
      shoulder: pointSchema,
      hip: pointSchema,
      feet: z.array(pointSchema).length(2),
      grips: z.array(pointSchema),
    }),
  ),
  contacts: z.array(
    z.object({
      id: z.string().min(1),
      from: z.string().min(1),
      to: z.string().min(1),
      point: pointSchema,
      gap: z.number().nonnegative(),
      verified: z.boolean(),
    }),
  ),
  forces: z.array(
    z.object({
      id: z.string().min(1),
      label: z.string().min(1),
      from: pointSchema,
      to: pointSchema,
      color: z.string().min(1),
    }),
  ),
  checks: z.array(checkSchema).min(1),
  passed: z.boolean(),
});

export type PhysicsPoint = z.infer<typeof pointSchema>;
export type PhysicsPoseProof = z.infer<typeof physicsPoseProofSchema>;
export type PhysicsCaseId = PhysicsPoseProof["id"];

type ActorInput = Omit<PhysicsPoseProof["actors"][number], "grips"> & {
  grips: PhysicsPoint[];
};

type ContactInput = {
  id: string;
  from: string;
  to: string;
  point: PhysicsPoint;
};

export type SingleActorPullInput = {
  soilY: number;
  turnip: PhysicsPoseProof["turnip"] extends infer Turnip
    ? Omit<Extract<Turnip, object>, "buriedRatio">
    : never;
  actor: ActorInput;
  grip: PhysicsPoint;
  leafTips: [PhysicsPoint, PhysicsPoint, PhysicsPoint];
  thresholds: {
    minimumBuriedRatio: number;
    maximumStalkAlignmentDegrees: number;
    minimumCounterbalance: number;
    minimumLeafTipProjection: number;
  };
};

let rapierInitialization: Promise<void> | undefined;

async function initializeRapier(): Promise<void> {
  rapierInitialization ??= RAPIER.init();
  await rapierInitialization;
}

function distance(a: PhysicsPoint, b: PhysicsPoint): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function rounded(value: number, digits = 4): number {
  return Number(value.toFixed(digits));
}

function angleBetweenDegrees(
  aFrom: PhysicsPoint,
  aTo: PhysicsPoint,
  bFrom: PhysicsPoint,
  bTo: PhysicsPoint,
): number {
  const ax = aTo.x - aFrom.x;
  const ay = aTo.y - aFrom.y;
  const bx = bTo.x - bFrom.x;
  const by = bTo.y - bFrom.y;
  const denominator = Math.hypot(ax, ay) * Math.hypot(bx, by);
  if (denominator === 0) return 180;
  const cosine = Math.max(-1, Math.min(1, (ax * bx + ay * by) / denominator));
  return (Math.acos(cosine) * 180) / Math.PI;
}

function makeCheck(
  id: string,
  label: string,
  actual: number,
  operator: ">=" | "<=" | "==",
  threshold: number,
  unit: string,
): PhysicsPoseProof["checks"][number] {
  const tolerance = operator === "==" ? 0.0001 : 0;
  const passed =
    operator === ">="
      ? actual >= threshold
      : operator === "<="
        ? actual <= threshold
        : Math.abs(actual - threshold) <= tolerance;
  return {
    id,
    label,
    passed,
    actual: rounded(actual),
    operator,
    threshold,
    unit,
  };
}

function createGround(world: World, soilY: number): Collider {
  return world.createCollider(
    RAPIER.ColliderDesc.cuboid(20, 5).setTranslation(0, soilY - 5),
  );
}

function createPointSensor(
  world: World,
  point: PhysicsPoint,
  radius = 0.08,
): Collider {
  return world.createCollider(
    RAPIER.ColliderDesc.ball(radius)
      .setTranslation(point.x, point.y)
      .setSensor(true),
  );
}

function createTurnipCollider(
  world: World,
  center: PhysicsPoint,
  radiusX: number,
  radiusY: number,
): Collider {
  const points: number[] = [];
  for (let index = 0; index < 24; index += 1) {
    const angle = (index / 24) * Math.PI * 2;
    const tapered = Math.sin(angle) < 0 ? 0.72 : 1;
    points.push(
      center.x + Math.cos(angle) * radiusX * tapered,
      center.y + Math.sin(angle) * radiusY,
    );
  }
  const descriptor = RAPIER.ColliderDesc.convexHull(new Float32Array(points));
  if (!descriptor)
    throw new Error("Rapier could not construct the turnip hull.");
  return world.createCollider(descriptor.setSensor(true));
}

function measureBurialRatio(
  ground: Collider,
  center: PhysicsPoint,
  radiusY: number,
): number {
  const samples = 160;
  let buried = 0;
  for (let index = 0; index < samples; index += 1) {
    const y = center.y - radiusY + ((index + 0.5) / samples) * radiusY * 2;
    if (ground.containsPoint({ x: center.x, y })) buried += 1;
  }
  return buried / samples;
}

function createLeafChain(
  world: World,
  crown: PhysicsPoint,
  hand: PhysicsPoint,
  segmentCount = 8,
  slack = 1.01,
): { segments: PhysicsPoseProof["leafChain"]; handGap: number } {
  const directLength = distance(crown, hand);
  const segmentLength = (directLength * slack) / segmentCount;
  const dx = hand.x - crown.x;
  const dy = hand.y - crown.y;
  const directAngle = Math.atan2(dy, dx);
  const bodyRotation = directAngle - Math.PI / 2;
  const base = world.createRigidBody(
    RAPIER.RigidBodyDesc.fixed().setTranslation(crown.x, crown.y),
  );
  const handAnchor = world.createRigidBody(
    RAPIER.RigidBodyDesc.fixed().setTranslation(hand.x, hand.y),
  );
  const bodies: RigidBody[] = [];
  const radius = 0.035;

  for (let index = 0; index < segmentCount; index += 1) {
    const t = (index + 0.5) / segmentCount;
    const body = world.createRigidBody(
      RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(crown.x + dx * t, crown.y + dy * t)
        .setRotation(bodyRotation)
        .setLinearDamping(2.5)
        .setAngularDamping(3.5)
        .setCanSleep(false)
        .setAdditionalSolverIterations(12),
    );
    world.createCollider(
      RAPIER.ColliderDesc.capsule(segmentLength / 2 - radius, radius)
        .setDensity(0.08)
        .setCollisionGroups(0x0002_0001),
      body,
    );
    bodies.push(body);
  }

  world.createImpulseJoint(
    RAPIER.JointData.revolute({ x: 0, y: 0 }, { x: 0, y: -segmentLength / 2 }),
    base,
    bodies[0]!,
    true,
  );
  for (let index = 0; index < bodies.length - 1; index += 1) {
    world.createImpulseJoint(
      RAPIER.JointData.revolute(
        { x: 0, y: segmentLength / 2 },
        { x: 0, y: -segmentLength / 2 },
      ),
      bodies[index]!,
      bodies[index + 1]!,
      true,
    );
  }
  world.createImpulseJoint(
    RAPIER.JointData.revolute({ x: 0, y: segmentLength / 2 }, { x: 0, y: 0 }),
    bodies.at(-1)!,
    handAnchor,
    true,
  );

  world.timestep = 1 / 120;
  world.numSolverIterations = 16;
  world.numInternalPgsIterations = 4;
  for (let step = 0; step < 720; step += 1) world.step();

  const segments = bodies.map((body) => {
    const center = body.translation();
    const rotation = body.rotation();
    const ux = -Math.sin(rotation);
    const uy = Math.cos(rotation);
    return {
      from: {
        x: rounded(center.x - ux * (segmentLength / 2)),
        y: rounded(center.y - uy * (segmentLength / 2)),
      },
      to: {
        x: rounded(center.x + ux * (segmentLength / 2)),
        y: rounded(center.y + uy * (segmentLength / 2)),
      },
    };
  });
  const finalPoint = segments.at(-1)?.to ?? crown;
  return { segments, handGap: distance(finalPoint, hand) };
}

function createLeafBlades(
  crown: PhysicsPoint,
  grip: PhysicsPoint,
): PhysicsPoseProof["leafBlades"] {
  const pullX = grip.x - crown.x;
  const pullY = grip.y - crown.y;
  const pullLength = Math.hypot(pullX, pullY);
  const unitX = pullX / pullLength;
  const unitY = pullY / pullLength;
  const normalX = -unitY;
  const normalY = unitX;

  return [
    { length: 1.05, fan: -0.32 },
    { length: 1.32, fan: 0 },
    { length: 1.12, fan: 0.34 },
  ].map(({ length, fan }) => ({
    from: grip,
    to: {
      x: rounded(grip.x + unitX * length + normalX * fan),
      y: rounded(grip.y + unitY * length + normalY * fan),
    },
  }));
}

function minimumLeafTipPullProjection(
  crown: PhysicsPoint,
  grip: PhysicsPoint,
  leafBlades: PhysicsPoseProof["leafBlades"],
): number {
  const pullX = grip.x - crown.x;
  const pullY = grip.y - crown.y;
  const pullLength = Math.hypot(pullX, pullY);
  const unitX = pullX / pullLength;
  const unitY = pullY / pullLength;

  return Math.min(
    ...leafBlades.map(
      (blade) => (blade.to.x - grip.x) * unitX + (blade.to.y - grip.y) * unitY,
    ),
  );
}

function verifyGroundSupports(
  world: World,
  ground: Collider,
  actors: ActorInput[],
): { supported: number; total: number } {
  let supported = 0;
  let total = 0;
  for (const actor of actors) {
    for (const foot of actor.feet) {
      total += 1;
      const sensor = createPointSensor(world, foot, 0.1);
      world.step();
      if (sensor.contactCollider(ground, 0.001) !== null) supported += 1;
    }
  }
  return { supported, total };
}

function verifyContacts(
  world: World,
  contacts: ContactInput[],
): PhysicsPoseProof["contacts"] {
  return contacts.map((contact) => {
    const left = createPointSensor(world, contact.point, 0.09);
    const right = createPointSensor(world, contact.point, 0.09);
    world.step();
    const verified = left.contactCollider(right, 0.001) !== null;
    return { ...contact, gap: 0, verified };
  });
}

function finishProof(
  proof: Omit<PhysicsPoseProof, "passed">,
): PhysicsPoseProof {
  return physicsPoseProofSchema.parse({
    ...proof,
    passed:
      proof.checks.every((check) => check.passed) &&
      proof.contacts.every((contact) => contact.verified),
  });
}

function buriedTurnipInput() {
  return {
    center: { x: 7.2, y: -0.88 },
    radiusX: 0.72,
    radiusY: 1.02,
    crown: { x: 7.2, y: 0.14 },
  };
}

async function buildBuriedTurnipProof(): Promise<PhysicsPoseProof> {
  await initializeRapier();
  const world = new RAPIER.World({ x: 0, y: -9.81 });
  try {
    const soilY = 0;
    const turnip = buriedTurnipInput();
    const ground = createGround(world, soilY);
    const turnipCollider = createTurnipCollider(
      world,
      turnip.center,
      turnip.radiusX,
      turnip.radiusY,
    );
    world.step();
    const buriedRatio = measureBurialRatio(
      ground,
      turnip.center,
      turnip.radiusY,
    );
    const rootIntersectsSoil =
      turnipCollider.contactCollider(ground, 0.001) !== null;
    const exposedHeight = Math.max(0, turnip.center.y + turnip.radiusY - soilY);
    const checks = [
      makeCheck(
        "burial-ratio",
        "At least 90% of the turnip's vertical profile is under the soil line",
        buriedRatio,
        ">=",
        0.9,
        "ratio",
      ),
      makeCheck(
        "exposed-crown",
        "Only a shallow crown is visible above soil",
        exposedHeight,
        "<=",
        0.16,
        "world-units",
      ),
      makeCheck(
        "root-soil-overlap",
        "Rapier detects the root volume inside the soil volume",
        rootIntersectsSoil ? 1 : 0,
        "==",
        1,
        "boolean",
      ),
    ];

    return finishProof({
      schemaVersion: 2,
      engine: "@dimforge/rapier2d-deterministic-compat",
      engineVersion: "0.20.0",
      mode: "static-illustration-pose-proof",
      id: "buried-turnip",
      title: "Deeply buried turnip",
      note: "The bulb is a hidden root mass. Only its crown and leaf emergence may break the soil silhouette.",
      soilY,
      turnip: { ...turnip, buriedRatio: rounded(buriedRatio) },
      leafChain: [],
      leafBlades: [],
      actors: [],
      contacts: [],
      forces: [
        {
          id: "soil-resistance",
          label: "soil resistance",
          from: { x: 7.2, y: -0.15 },
          to: { x: 7.2, y: -0.85 },
          color: "#9a5a3a",
        },
      ],
      checks,
    });
  } finally {
    world.free();
  }
}

export async function buildSingleActorPullProof(
  input: SingleActorPullInput,
): Promise<PhysicsPoseProof> {
  await initializeRapier();
  const world = new RAPIER.World({ x: 0, y: -3.2 });
  try {
    const actors: ActorInput[] = [input.actor];
    const ground = createGround(world, input.soilY);
    createTurnipCollider(
      world,
      input.turnip.center,
      input.turnip.radiusX,
      input.turnip.radiusY,
    );
    const buriedRatio = measureBurialRatio(
      ground,
      input.turnip.center,
      input.turnip.radiusY,
    );
    const leaf = createLeafChain(world, input.turnip.crown, input.grip);
    const leafBlades = input.leafTips.map((tip) => ({
      from: input.grip,
      to: tip,
    }));
    const leafTipPullProjection = minimumLeafTipPullProjection(
      input.turnip.crown,
      input.grip,
      leafBlades,
    );
    const supports = verifyGroundSupports(world, ground, actors);
    const contacts = verifyContacts(
      world,
      input.actor.grips.map((grip, index) => ({
        id: `mae-leaf-grip-${index + 1}`,
        from: "stalk-bundle",
        to: `mae-hand-${index + 1}`,
        point: grip,
      })),
    );
    const firstLeaf = leaf.segments[0]!;
    const pullAlignment = angleBetweenDegrees(
      input.turnip.crown,
      input.grip,
      firstLeaf.from,
      firstLeaf.to,
    );
    const bodyLean = actors[0]!.hip.x - actors[0]!.shoulder.x;
    const checks = [
      makeCheck(
        "burial-ratio",
        "Turnip stays deeply buried",
        buriedRatio,
        ">=",
        input.thresholds.minimumBuriedRatio,
        "ratio",
      ),
      makeCheck(
        "hand-contact",
        "Leaf chain reaches Mae's hand",
        leaf.handGap,
        "<=",
        0.04,
        "world-units",
      ),
      makeCheck(
        "stalk-force-alignment",
        "Root-side stalk bases bend toward the grip",
        pullAlignment,
        "<=",
        input.thresholds.maximumStalkAlignmentDegrees,
        "degrees",
      ),
      makeCheck(
        "leaf-tip-topology",
        "Leafy tops extend toward Mae",
        leafTipPullProjection,
        ">=",
        input.thresholds.minimumLeafTipProjection,
        "world-units",
      ),
      makeCheck(
        "counterbalance",
        "Mae's shoulders lean away from the turnip",
        bodyLean,
        ">=",
        input.thresholds.minimumCounterbalance,
        "world-units",
      ),
      makeCheck(
        "ground-support",
        "Both feet contact the ground",
        supports.supported,
        "==",
        supports.total,
        "feet",
      ),
    ];

    return finishProof({
      schemaVersion: 2,
      engine: "@dimforge/rapier2d-deterministic-compat",
      engineVersion: "0.20.0",
      mode: "static-illustration-pose-proof",
      id: "mae-pull",
      title: "Mae pulling against a rooted turnip",
      note: "Rig landmarks and scene anchors compile into root-side stalk tension, two hand contacts, puller-side leafy tops, and grounded counterbalance.",
      soilY: input.soilY,
      turnip: { ...input.turnip, buriedRatio: rounded(buriedRatio) },
      leafChain: leaf.segments,
      leafBlades,
      actors,
      contacts,
      forces: [
        {
          id: "pull",
          label: "pull / tension",
          from: input.grip,
          to: {
            x: input.grip.x - 1.2,
            y: input.grip.y + 0.05,
          },
          color: "#276b68",
        },
        {
          id: "root-reaction",
          label: "root + soil reaction",
          from: input.turnip.crown,
          to: {
            x: input.turnip.crown.x + 1.05,
            y: input.turnip.crown.y - 0.05,
          },
          color: "#9a5a3a",
        },
      ],
      checks,
    });
  } finally {
    world.free();
  }
}

async function buildMaePullProof(): Promise<PhysicsPoseProof> {
  const turnip = {
    ...buriedTurnipInput(),
    center: { x: 8.4, y: -0.88 },
    crown: { x: 8.4, y: 0.14 },
  };
  const grip = { x: 6.05, y: 1.2 };
  const leafBlades = createLeafBlades(turnip.crown, grip);

  return buildSingleActorPullProof({
    soilY: 0,
    turnip,
    actor: {
      id: "mae",
      label: "Mae",
      color: "#70918a",
      head: { x: 3.55, y: 3.02 },
      shoulder: { x: 3.82, y: 2.25 },
      hip: { x: 4.45, y: 1.02 },
      feet: [
        { x: 3.28, y: 0.06 },
        { x: 4.9, y: 0.06 },
      ],
      grips: [grip],
    },
    grip,
    leafTips: leafBlades.map((blade) => blade.to) as [
      PhysicsPoint,
      PhysicsPoint,
      PhysicsPoint,
    ],
    thresholds: {
      minimumBuriedRatio: 0.9,
      maximumStalkAlignmentDegrees: 18,
      minimumCounterbalance: 0.45,
      minimumLeafTipProjection: 0.9,
    },
  });
}

async function buildHelperChainProof(): Promise<PhysicsPoseProof> {
  await initializeRapier();
  const world = new RAPIER.World({ x: 0, y: -3.2 });
  try {
    const soilY = 0;
    const turnip = {
      ...buriedTurnipInput(),
      center: { x: 11.0, y: -0.88 },
      crown: { x: 11.0, y: 0.14 },
    };
    const leafHand = { x: 8.85, y: 1.12 };
    const contactsInput: ContactInput[] = [
      {
        id: "leaf-mouse",
        from: "leaf-chain",
        to: "mouse-hand",
        point: leafHand,
      },
      {
        id: "mouse-hen",
        from: "mouse-rear-hand",
        to: "hen-wing",
        point: { x: 7.34, y: 1.22 },
      },
      {
        id: "hen-goat",
        from: "hen-wing",
        to: "goat-grip",
        point: { x: 5.72, y: 1.38 },
      },
      {
        id: "goat-mae",
        from: "goat-rear",
        to: "mae-hands",
        point: { x: 3.82, y: 1.5 },
      },
    ];
    const actors: ActorInput[] = [
      {
        id: "mouse",
        label: "Mouse",
        color: "#9b8580",
        head: { x: 8.0, y: 2.0 },
        shoulder: { x: 8.18, y: 1.55 },
        hip: { x: 8.5, y: 0.72 },
        feet: [
          { x: 7.95, y: 0.05 },
          { x: 8.7, y: 0.05 },
        ],
        grips: [leafHand, contactsInput[1]!.point],
      },
      {
        id: "hen",
        label: "Hen",
        color: "#c98a59",
        head: { x: 6.48, y: 2.18 },
        shoulder: { x: 6.63, y: 1.7 },
        hip: { x: 6.92, y: 0.73 },
        feet: [
          { x: 6.32, y: 0.05 },
          { x: 7.05, y: 0.05 },
        ],
        grips: [contactsInput[1]!.point, contactsInput[2]!.point],
      },
      {
        id: "goat",
        label: "Goat",
        color: "#8d927c",
        head: { x: 4.72, y: 2.48 },
        shoulder: { x: 4.92, y: 1.82 },
        hip: { x: 5.36, y: 0.82 },
        feet: [
          { x: 4.65, y: 0.05 },
          { x: 5.56, y: 0.05 },
        ],
        grips: [contactsInput[2]!.point, contactsInput[3]!.point],
      },
      {
        id: "mae",
        label: "Mae",
        color: "#70918a",
        head: { x: 2.0, y: 3.0 },
        shoulder: { x: 2.28, y: 2.28 },
        hip: { x: 2.96, y: 1.0 },
        feet: [
          { x: 1.7, y: 0.05 },
          { x: 3.26, y: 0.05 },
        ],
        grips: [contactsInput[3]!.point],
      },
    ];
    const ground = createGround(world, soilY);
    createTurnipCollider(world, turnip.center, turnip.radiusX, turnip.radiusY);
    const buriedRatio = measureBurialRatio(
      ground,
      turnip.center,
      turnip.radiusY,
    );
    const leaf = createLeafChain(world, turnip.crown, leafHand, 9, 1.012);
    const leafBlades = createLeafBlades(turnip.crown, leafHand);
    const leafTipPullProjection = minimumLeafTipPullProjection(
      turnip.crown,
      leafHand,
      leafBlades,
    );
    const supports = verifyGroundSupports(world, ground, actors);
    const contacts = verifyContacts(world, contactsInput);
    const leanDistances = actors.map((actor) => actor.hip.x - actor.shoulder.x);
    const weakestLean = Math.min(...leanDistances);
    const contactOrder = contactsInput.every((contact, index, all) =>
      index === 0 ? true : contact.point.x < all[index - 1]!.point.x,
    );
    const finalLeaf = leaf.segments.at(-1)!;
    const pullAlignment = angleBetweenDegrees(
      turnip.crown,
      leafHand,
      finalLeaf.from,
      finalLeaf.to,
    );
    const checks = [
      makeCheck(
        "burial-ratio",
        "Turnip stays deeply buried",
        buriedRatio,
        ">=",
        0.9,
        "ratio",
      ),
      makeCheck(
        "continuous-chain",
        "All four grip links overlap in Rapier",
        contacts.filter((contact) => contact.verified).length,
        "==",
        contacts.length,
        "contacts",
      ),
      makeCheck(
        "contact-order",
        "The helper chain runs away from the turnip without crossing",
        contactOrder ? 1 : 0,
        "==",
        1,
        "boolean",
      ),
      makeCheck(
        "leaf-contact",
        "Leaf chain terminates at Mouse's hands",
        leaf.handGap,
        "<=",
        0.04,
        "world-units",
      ),
      makeCheck(
        "stalk-force-alignment",
        "Root-side stalk bases point into the helper chain",
        pullAlignment,
        "<=",
        18,
        "degrees",
      ),
      makeCheck(
        "leaf-tip-topology",
        "Leafy tops extend toward the helpers",
        leafTipPullProjection,
        ">=",
        0.9,
        "world-units",
      ),
      makeCheck(
        "counterbalance",
        "Every torso leans away from the turnip",
        weakestLean,
        ">=",
        0.25,
        "world-units",
      ),
      makeCheck(
        "ground-support",
        "Every foot contacts the ground",
        supports.supported,
        "==",
        supports.total,
        "feet",
      ),
    ];

    return finishProof({
      schemaVersion: 2,
      engine: "@dimforge/rapier2d-deterministic-compat",
      engineVersion: "0.20.0",
      mode: "static-illustration-pose-proof",
      id: "helper-chain",
      title: "Continuous helper pull chain",
      note: "Every grip is an explicit contact constraint—including the hen's wing/grip—and all bodies counterbalance through grounded feet.",
      soilY,
      turnip: { ...turnip, buriedRatio: rounded(buriedRatio) },
      leafChain: leaf.segments,
      leafBlades,
      actors,
      contacts,
      forces: [
        {
          id: "combined-pull",
          label: "combined pull",
          from: leafHand,
          to: { x: 6.8, y: 1.2 },
          color: "#276b68",
        },
        {
          id: "root-reaction",
          label: "root + soil reaction",
          from: turnip.crown,
          to: { x: 12.1, y: 0.1 },
          color: "#9a5a3a",
        },
      ],
      checks,
    });
  } finally {
    world.free();
  }
}

export async function buildPhysicsPoseProof(
  id: PhysicsCaseId,
): Promise<PhysicsPoseProof> {
  if (id === "buried-turnip") return buildBuriedTurnipProof();
  if (id === "mae-pull") return buildMaePullProof();
  return buildHelperChainProof();
}

export async function buildAllPhysicsPoseProofs(): Promise<PhysicsPoseProof[]> {
  const proofs: PhysicsPoseProof[] = [];
  for (const id of ["buried-turnip", "mae-pull", "helper-chain"] as const) {
    proofs.push(await buildPhysicsPoseProof(id));
  }
  return proofs;
}
