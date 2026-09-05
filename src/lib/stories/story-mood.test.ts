import { describe, expect, it } from "vitest";

import { storyMoodInstruction } from "@/lib/stories/story-mood";

describe("story mood prompt guidance", () => {
  it("turns a selected mood into a concrete required creative constraint", () => {
    const instruction = storyMoodInstruction({
      storyMood: "funny_playful",
      customStoryMood: undefined,
      desiredFeeling: undefined,
    });

    expect(instruction).toContain("Required parent-selected mood");
    expect(instruction).toContain("Funny and playful");
    expect(instruction).toContain("comic complications");
    expect(instruction).toContain("dialogue");
  });

  it("preserves a parent's custom mood instead of substituting a preset", () => {
    expect(
      storyMoodInstruction({
        storyMood: "something_else",
        customStoryMood: "Dreamy but a little mischievous",
        desiredFeeling: undefined,
      }),
    ).toContain("Dreamy but a little mischievous");
  });
});
