import { describe, expect, it } from "vitest";

import { storyThemeInstruction } from "@/lib/stories/story-theme";

describe("story theme prompt guidance", () => {
  it("turns the selection into an enacted story constraint", () => {
    const instruction = storyThemeInstruction({
      storyTheme: "asking_for_help",
      customStoryTheme: undefined,
      valueOrQuestion: undefined,
    });
    expect(instruction).toContain("Required parent-selected idea");
    expect(instruction).toContain("choose to ask for help");
    expect(instruction).toContain("not a stated lesson");
  });

  it("preserves a custom question", () => {
    expect(
      storyThemeInstruction({
        storyTheme: "something_else",
        customStoryTheme: "What makes somewhere feel like home?",
        valueOrQuestion: undefined,
      }),
    ).toContain("What makes somewhere feel like home?");
  });
});
