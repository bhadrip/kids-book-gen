import { zodTextFormat } from "openai/helpers/zod";
import { describe, expect, it } from "vitest";

import { evaluationResponseSchema } from "@/lib/directions/openai-text-provider";

describe("OpenAI story evaluation response", () => {
  it("converts to a strict structured-output format without transforms", () => {
    expect(() =>
      zodTextFormat(evaluationResponseSchema, "story_evaluation"),
    ).not.toThrow();
  });
});
