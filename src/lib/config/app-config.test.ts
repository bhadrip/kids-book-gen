import { describe, expect, it } from "vitest";

import { readAppConfig } from "./app-config";

describe("readAppConfig", () => {
  it("uses safe local defaults when optional settings are absent", () => {
    expect(readAppConfig({})).toMatchObject({
      textModel: "gpt-5.6-luna",
      imageModel: "gpt-image-2",
      projectRoot: "data/projects",
      bookBudgetUsd: 3,
      textProvider: "openai",
      fixtureDelayMs: 0,
    });
  });

  it("rejects a non-positive book budget", () => {
    expect(() => readAppConfig({ KIDS_BOOK_BOOK_BUDGET_USD: "0" })).toThrow();
  });

  it("accepts a bounded fixture delay for observable browser states", () => {
    expect(
      readAppConfig({ KIDS_BOOK_FIXTURE_DELAY_MS: "400" }).fixtureDelayMs,
    ).toBe(400);
    expect(() =>
      readAppConfig({ KIDS_BOOK_FIXTURE_DELAY_MS: "6000" }),
    ).toThrow();
  });
});
