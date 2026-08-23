import { describe, expect, it } from "vitest";

import {
  readerConfigurationSchema,
  readerProfileGuidance,
} from "@/lib/readers/reader-profile";

describe("reader profiles", () => {
  it("accepts only exact ages 3 through 10", () => {
    expect(
      readerConfigurationSchema.parse({
        age: "3",
        readingMode: "parent_read_aloud",
      }).age,
    ).toBe(3);
    expect(() =>
      readerConfigurationSchema.parse({
        age: 2,
        readingMode: "parent_read_aloud",
      }),
    ).toThrow("Choose an age from 3 through 10");
    expect(() =>
      readerConfigurationSchema.parse({
        age: 11,
        readingMode: "parent_read_aloud",
      }),
    ).toThrow("Choose an age from 3 through 10");
  });

  it("materially changes guidance by age and reading mode", () => {
    const preschoolReadAloud = readerProfileGuidance({
      age: 4,
      readingMode: "parent_read_aloud",
      profileVersion: "reader-profiles-v1",
    });
    const olderIndependent = readerProfileGuidance({
      age: 9,
      readingMode: "independent_developing",
      profileVersion: "reader-profiles-v1",
    });

    expect(preschoolReadAloud).toContain("visible cause and effect");
    expect(preschoolReadAloud).toContain("oral flow");
    expect(olderIndependent).toContain("layered causal chains");
    expect(olderIndependent).toContain("manageable decoding load");
    expect(olderIndependent).not.toEqual(preschoolReadAloud);
  });
});
