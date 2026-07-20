import { describe, expect, it } from "vitest";

import { readAppConfig } from "./app-config";

describe("readAppConfig", () => {
  it("uses safe local defaults when optional settings are absent", () => {
    expect(readAppConfig({})).toMatchObject({
      textModel: "gpt-5.6-luna",
      imageModel: "gpt-image-2",
      projectRoot: "data/projects",
      bookBudgetUsd: 3,
    });
  });

  it("rejects a non-positive book budget", () => {
    expect(() => readAppConfig({ KIDS_BOOK_BOOK_BUDGET_USD: "0" })).toThrow();
  });
});
