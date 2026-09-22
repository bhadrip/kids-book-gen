import { describe, expect, it } from "vitest";

import {
  compilePullScene,
  type CharacterPullRig,
  type PullPageSpec,
} from "@/lib/illustration-physics/pull-scene-compiler";

const rig: CharacterPullRig = {
  id: "mae-pull-v1",
  asset: { source: "mae.png", width: 1_374, height: 1_145 },
  landmarks: {
    head: { x: 0.52, y: 0.25 },
    shoulder: { x: 0.57, y: 0.4 },
    hip: { x: 0.55, y: 0.67 },
    leftFoot: { x: 0.25, y: 0.95 },
    rightFoot: { x: 0.62, y: 0.95 },
    leftHand: { x: 0.84, y: 0.43 },
    rightHand: { x: 0.88, y: 0.43 },
  },
};

const pageSpec: PullPageSpec = {
  id: "turnip-pull-page-poc-v1",
  page: { width: 1_536, height: 1_024, pixelsPerWorldUnit: 120 },
  characterPlacement: { left: 80, top: 180, width: 900 },
  sceneAnchors: { soilY: 900, crown: { x: 1_190, y: 862 } },
  action: {
    type: "pull-rooted-plant",
    leafTopLength: 235,
    turnipRadiusX: 86,
    turnipRadiusY: 104,
    minimumBuriedRatio: 0.9,
    maximumStalkAlignmentDegrees: 18,
    minimumCounterbalance: 0.35,
    performanceIntensity: 4,
  },
};

describe("pull scene compiler", () => {
  it("derives page and Rapier coordinates from a reusable rig and page anchors", () => {
    const compiled = compilePullScene(rig, pageSpec);

    expect(compiled.source).toEqual({
      rigId: "mae-pull-v1",
      pageSpecId: "turnip-pull-page-poc-v1",
    });
    expect(compiled.pageCoordinates.grip).toMatchObject({
      x: 854,
      y: 502.5,
    });
    expect(compiled.rapierInput.turnip.crown).toEqual({
      x: 9.9167,
      y: 0.3167,
    });
    expect(compiled.rapierInput.actor.grips).toHaveLength(2);
  });

  it("places every leafy tip beyond the grip on Mae's side of the crown", () => {
    const compiled = compilePullScene(rig, pageSpec);
    const { crown, grip, leafTips } = compiled.pageCoordinates;
    const pull = { x: grip.x - crown.x, y: grip.y - crown.y };

    for (const tip of leafTips) {
      const extension = { x: tip.x - grip.x, y: tip.y - grip.y };
      expect(extension.x * pull.x + extension.y * pull.y).toBeGreaterThan(0);
      expect(tip.x).toBeLessThan(grip.x);
    }
  });

  it("rejects a crown placed directly on the grip", () => {
    expect(() =>
      compilePullScene(rig, {
        ...pageSpec,
        sceneAnchors: {
          ...pageSpec.sceneAnchors,
          crown: { x: 854, y: 502.5 },
        },
      }),
    ).toThrow("must not occupy the same point");
  });
});
