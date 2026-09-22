import { describe, expect, it } from "vitest";

import {
  buildAllPhysicsPoseProofs,
  buildPhysicsPoseProof,
  physicsPoseProofSchema,
} from "@/lib/illustration-physics/rapier-pose-proof";

describe("Rapier illustration pose proofs", () => {
  it("keeps the turnip deeply buried with only a shallow crown exposed", async () => {
    const proof = await buildPhysicsPoseProof("buried-turnip");

    expect(proof.passed).toBe(true);
    expect(proof.turnip.buriedRatio).toBeGreaterThanOrEqual(0.9);
    expect(proof.checks).toContainEqual(
      expect.objectContaining({ id: "root-soil-overlap", passed: true }),
    );
  });

  it("solves a tensioned leaf chain into Mae's hand with grounded counterbalance", async () => {
    const proof = await buildPhysicsPoseProof("mae-pull");

    expect(proof.passed).toBe(true);
    expect(proof.leafChain).toHaveLength(8);
    expect(proof.contacts).toContainEqual(
      expect.objectContaining({ id: "mae-leaf-grip-1", verified: true }),
    );
    expect(proof.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "stalk-force-alignment", passed: true }),
        expect.objectContaining({ id: "leaf-tip-topology", passed: true }),
        expect.objectContaining({ id: "ground-support", passed: true }),
      ]),
    );
    expect(
      proof.leafBlades.every(
        (blade) =>
          blade.to.x < blade.from.x && blade.to.x < proof.turnip.crown.x,
      ),
    ).toBe(true);
  });

  it("keeps every helper grip continuous, ordered, and supported", async () => {
    const proof = await buildPhysicsPoseProof("helper-chain");

    expect(proof.passed).toBe(true);
    expect(proof.contacts).toHaveLength(4);
    expect(proof.contacts.every((contact) => contact.verified)).toBe(true);
    expect(proof.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "contact-order", passed: true }),
        expect.objectContaining({ id: "leaf-tip-topology", passed: true }),
        expect.objectContaining({ id: "counterbalance", passed: true }),
      ]),
    );
  });

  it("is deterministic across repeated runs", async () => {
    const first = await buildAllPhysicsPoseProofs();
    const second = await buildAllPhysicsPoseProofs();

    expect(second).toEqual(first);
    for (const proof of first) {
      expect(physicsPoseProofSchema.parse(proof)).toEqual(proof);
    }
  });
});
