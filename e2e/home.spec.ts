import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { readFile, rm } from "node:fs/promises";
import { join } from "node:path";

const testProjectRoot = join(process.cwd(), "test-results", "projects");
const testCharacterRoot = join(process.cwd(), "test-results", "characters");

async function createApprovedFixtureStory(
  page: Page,
  title: string,
  originalIdea: string,
  mustKeep = "Keep Milo's round glasses and the silver moon kite.",
) {
  await page.goto("/");
  await page.getByLabel("Project title").fill(title);
  await page.getByRole("button", { name: "Create local project" }).click();
  const projectId = (
    await page.getByText("Project ID:").textContent()
  )?.replace("Project ID: ", "");
  await page.getByRole("link", { name: "Shape the story idea" }).click();
  await page.getByLabel("Original idea").fill(originalIdea);
  await page.getByLabel("Must keep").fill(mustKeep);
  await page.getByRole("button", { name: "Generate three directions" }).click();
  await expect(
    page.getByRole("heading", { name: "Three ways this story could go" }),
  ).toBeVisible();
  const firstDirection = page.getByRole("region", {
    name: "The Moon Kite Mission",
  });
  await Promise.all([
    page.waitForURL(`**/projects/${projectId}/story`),
    firstDirection
      .getByRole("button", { name: "Choose this direction" })
      .click(),
  ]);
  await expect(
    page.getByRole("heading", { name: "The Moon Kite Mission" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Approve this story" }).click();
  await expect(page.getByText("Story approved and saved.")).toBeVisible();
  return projectId;
}

async function approveFixtureVisual(page: Page, projectId: string) {
  await page.goto(`/projects/${projectId}/look`);
  await page
    .getByRole("button", { name: "Create the visual story plan" })
    .click();
  await page
    .getByRole("button", { name: "Yes, continue to the character" })
    .click();
  await page
    .getByRole("button", { name: "Create three character designs" })
    .click();
  await page
    .getByRole("region", { name: "Character design 1" })
    .getByRole("button", { name: "Choose design 1" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Review the sample spread" }),
  ).toBeVisible({ timeout: 15_000 });
  await page
    .getByRole("button", { name: "Approve this visual direction" })
    .click();
  await expect(page.getByText("Your book’s look is approved.")).toBeVisible();
}

test("shows the local Storytime Studio foundation", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "A family idea, made into a real storybook.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Local setup status" }),
  ).toContainText("Ready to use");
});

test("creates a local project that can be reopened from the project list", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Project title").fill("Milo's Playwright Moon Kite");
  await page.getByRole("button", { name: "Create local project" }).click();

  await expect(
    page.getByRole("heading", { name: "Milo's Playwright Moon Kite" }),
  ).toBeVisible();
  const projectId = (
    await page.getByText("Project ID:").textContent()
  )?.replace("Project ID: ", "");
  expect(projectId).toMatch(/^[0-9a-f-]{36}$/);

  await page.getByRole("link", { name: "Back to your projects" }).click();
  await expect(
    page.getByRole("link", { name: "Milo's Playwright Moon Kite" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Milo's Playwright Moon Kite" }).click();
  await expect(
    page.getByRole("heading", { name: "Milo's Playwright Moon Kite" }),
  ).toBeVisible();

  await rm(join(testProjectRoot, projectId ?? ""), {
    recursive: true,
    force: true,
  });
});

test("offers a parent-safe idea intake without making a model request", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Project title").fill("Playwright idea intake project");
  await page.getByRole("button", { name: "Create local project" }).click();
  const projectId = (
    await page.getByText("Project ID:").textContent()
  )?.replace("Project ID: ", "");

  await page.getByRole("link", { name: "Shape the story idea" }).click();
  await expect(
    page.getByRole("heading", { name: "What should this story keep?" }),
  ).toBeVisible();
  await expect(page.getByLabel("Original idea")).toBeVisible();
  await expect(page.getByLabel("Must keep")).toBeVisible();
  await expect(page.getByLabel("Intended reader age")).toHaveValue("8");
  await expect(
    page.getByLabel("How will the child read this book?"),
  ).toHaveValue("parent_read_aloud");
  await expect(
    page.getByRole("group", { name: "How should the story unfold?" }),
  ).toBeVisible();
  await expect(page.getByLabel("Recommend the best story shape")).toBeChecked();
  await expect(page.getByText("Three Bears’ house")).toBeVisible();
  await expect(
    page.getByRole("group", { name: "What mood should the story have?" }),
  ).toBeVisible();
  await expect(page.getByLabel("No preference")).toBeChecked();
  await expect(page.getByText("Silly surprises")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Generate three directions" }),
  ).toBeVisible();
  await page.goto(`/projects/${projectId}/book/read`);
  await expect(
    page.getByRole("heading", { name: "The family reader is not ready yet." }),
  ).toBeVisible();
  await expect(page.getByText("Finish all 16 pages")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Return to book review" }),
  ).toBeVisible();

  await rm(join(testProjectRoot, projectId ?? ""), {
    recursive: true,
    force: true,
  });
});

test("revises directions, generates a story, approves it, and reopens it without model tokens", async ({
  page,
}) => {
  test.setTimeout(75_000);
  await page.goto("/");
  await page.getByLabel("Project title").fill("Fixture story journey");
  await page.getByRole("button", { name: "Create local project" }).click();
  const projectId = (
    await page.getByText("Project ID:").textContent()
  )?.replace("Project ID: ", "");

  await page.getByRole("link", { name: "Shape the story idea" }).click();
  await page
    .getByLabel("Original idea")
    .fill("A moon kite flies away before bedtime.");
  await page.getByLabel("Intended reader age").selectOption("5");
  await page
    .getByLabel("How will the child read this book?")
    .selectOption("co_read");
  await page.getByLabel("Funny and playful").check();
  await page.getByLabel("Must keep").fill("Keep the moon kite and Milo.");
  await page.getByRole("button", { name: "Generate three directions" }).click();
  const directionGeneration = page.locator('form[aria-busy="true"]');
  await expect(
    directionGeneration.getByRole("button", {
      name: "Generating three directions…",
    }),
  ).toBeDisabled();
  await expect(directionGeneration.getByRole("status")).toContainText(
    "Your idea is saved",
  );
  await expect(page.getByText("In progress", { exact: true })).toBeVisible();
  await page.screenshot({
    path: "test-results/directions-generating.png",
    fullPage: true,
  });
  await expect
    .poll(async () => {
      try {
        const job = JSON.parse(
          await readFile(
            join(testProjectRoot, projectId ?? "", "text-generation-job.json"),
            "utf8",
          ),
        ) as { status?: unknown };
        return job.status;
      } catch {
        return "not_saved_yet";
      }
    })
    .toBe("in_progress");
  const reopenedOverview = await page.context().newPage();
  await reopenedOverview.goto(`/projects/${projectId}`);
  await expect(
    reopenedOverview
      .getByText("In progress", { exact: true })
      .or(reopenedOverview.getByText("Ready for your review", { exact: true }))
      .first(),
  ).toBeVisible();
  await expect(
    reopenedOverview
      .getByRole("link", { name: "Check generation status" })
      .or(
        reopenedOverview.getByRole("link", { name: "Review story directions" }),
      ),
  ).toBeVisible();
  await reopenedOverview.close();
  await expect(
    page.getByRole("heading", { name: "Three ways this story could go" }),
  ).toBeVisible();
  await expect(page.getByText("Written for age 5 (ages 3–5)")).toBeVisible();
  await expect
    .poll(async () => {
      const brief = JSON.parse(
        await readFile(
          join(testProjectRoot, projectId ?? "", "brief.json"),
          "utf8",
        ),
      ) as { storyMood?: unknown };
      return brief.storyMood;
    })
    .toBe("funny_playful");

  await page
    .getByLabel("Want three different directions?")
    .fill("Make them funnier");
  await page
    .getByRole("button", { name: "Revise all three directions" })
    .click();
  await expect(
    page.getByRole("button", { name: "Revising all three directions…" }),
  ).toBeDisabled();
  await expect(page.getByText("Direction revision 2")).toBeVisible();

  const firstDirection = page.getByRole("heading", {
    name: "The Moon Kite Mission — Make them funnier",
  });
  await expect(firstDirection).toBeVisible();
  const firstCard = page.getByRole("region", {
    name: "The Moon Kite Mission — Make them funnier",
  });
  await firstCard
    .getByLabel("Any steering for the next story step? (optional)")
    .fill("Keep the ending hopeful");
  const storyNavigation = page.waitForURL(`**/projects/${projectId}/story`);
  await firstCard
    .getByRole("button", { name: "Choose this direction" })
    .click();
  await expect(
    firstCard.getByRole("button", { name: "Generating this story…" }),
  ).toBeDisabled();
  await storyNavigation;

  await expect(
    page.getByRole("heading", {
      name: "The Moon Kite Mission — Make them funnier",
    }),
  ).toBeVisible();
  await expect(page.getByText("Story revision 1")).toBeVisible();
  await expect(page.getByText("Spread 13:")).toBeVisible();
  await page.getByLabel("What should change?").fill("Add one silly obstacle");
  const revisionNavigation = page.waitForURL(
    `**/projects/${projectId}/story?decision=revision_requested`,
  );
  await page.getByRole("button", { name: "Revise this story" }).click();
  await expect(
    page.getByRole("button", { name: "Revising this story…" }),
  ).toBeDisabled();
  await revisionNavigation;
  await expect(page.getByText("Story revision 2")).toBeVisible();
  await expect(page.getByText("Your revised story is ready.")).toBeVisible();
  await page.getByRole("button", { name: "Approve this story" }).click();
  await expect(page.getByText("Story approved and saved.")).toBeVisible();

  await page.goto(`/projects/${projectId}`);
  await expect(page.getByText("Approved", { exact: true })).toHaveCount(3);
  await page.goto(`/projects/${projectId}/story`);
  await expect(
    page.getByText("This story revision is approved."),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/text-story-approved.png",
    fullPage: true,
  });

  await rm(join(testProjectRoot, projectId ?? ""), {
    recursive: true,
    force: true,
  });
});

test("shows a saved-work recovery state when text generation fails", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Project title").fill("Fixture failure recovery");
  await page.getByRole("button", { name: "Create local project" }).click();
  const projectId = (
    await page.getByText("Project ID:").textContent()
  )?.replace("Project ID: ", "");

  await page.getByRole("link", { name: "Shape the story idea" }).click();
  await page.getByLabel("Original idea").fill("Fixture provider failure");
  await page.getByLabel("Must keep").fill("Keep this saved detail.");
  await page.getByRole("button", { name: "Generate three directions" }).click();

  await expect(
    page.getByRole("button", { name: "Generating three directions…" }),
  ).toBeDisabled();
  await expect(
    page.getByText("Your idea was saved locally.", { exact: false }),
  ).toBeVisible();
  await expect(page.getByLabel("Original idea")).toHaveValue(
    "Fixture provider failure",
  );
  await expect(page.getByLabel("Must keep")).toHaveValue(
    "Keep this saved detail.",
  );
  await expect(
    page.getByRole("button", { name: "Retry three directions" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Save and exit" }).click();
  await expect(page.getByText("Needs attention")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Retry story directions" }),
  ).toBeVisible();

  await rm(join(testProjectRoot, projectId ?? ""), {
    recursive: true,
    force: true,
  });
});

test("chooses a curated look, preserves character options, and approves a sample spread without model tokens", async ({
  page,
}) => {
  test.setTimeout(60_000);
  const projectId = await createApprovedFixtureStory(
    page,
    "Fixture visual journey",
    "A moon kite flies away before bedtime.",
  );

  await page.getByRole("link", { name: "Choose the visual identity" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Check how the story will unfold in pictures",
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Create the visual story plan" })
    .click();
  await expect(page.getByText("Plan revision 1")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Does this feel like your story?" }),
  ).toBeVisible();
  await page
    .getByText("Review the 13-part picture sequence", { exact: true })
    .click();
  await expect(
    page.getByTestId("visual-plan-sequence").locator("li"),
  ).toHaveCount(13);
  await expect(
    page
      .getByRole("complementary")
      .getByText("Keep Milo's round glasses and the silver moon kite.", {
        exact: true,
      }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/visual-story-plan.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Yes, continue to the character" })
    .click();
  await expect(
    page.getByText("Visual story plan approved.", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Choose an art direction" }),
  ).toBeVisible();
  await expect(page.getByLabel("Warm and handmade")).toBeChecked();
  await expect(page.getByLabel("Detailed discovery")).toBeVisible();
  await expect(
    page.getByAltText(
      "A pea with a leaf hat and red wagon painted in soft watercolor and colored pencil.",
    ),
  ).toBeVisible();
  await expect(
    page.getByAltText(
      "A pea with a leaf hat and red wagon in a finely inked garden rich with organized details.",
    ),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/visual-art-presets.png",
    fullPage: true,
  });

  await page
    .getByRole("button", { name: "Create three character designs" })
    .click();
  await expect(
    page.getByRole("button", { name: "Creating three character designs…" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("heading", {
      name: "Choose the character your child will recognize",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Character design 1" }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Character design 3" }),
  ).toBeVisible();
  await expect(page.getByText("Character design set 1")).toBeVisible();

  await page.getByRole("button", { name: "Regenerate three designs" }).click();
  await expect(
    page.getByRole("button", {
      name: "Regenerating three character designs…",
    }),
  ).toBeDisabled();
  await expect(page.getByText("Character design set 2")).toBeVisible();

  const firstDesignSet = JSON.parse(
    await readFile(
      join(testProjectRoot, projectId ?? "", "character-designs-01.json"),
      "utf8",
    ),
  ) as { revision?: unknown };
  const currentDesignSet = JSON.parse(
    await readFile(
      join(testProjectRoot, projectId ?? "", "character-designs.json"),
      "utf8",
    ),
  ) as { revision?: unknown };
  expect(firstDesignSet.revision).toBe(1);
  expect(currentDesignSet.revision).toBe(2);

  const secondDesign = page.getByRole("region", { name: "Character design 2" });
  const samplePending = expect(
    secondDesign.getByRole("button", {
      name: "Saving this character and making the sample…",
    }),
  ).toBeDisabled();
  await secondDesign.getByRole("button", { name: "Choose design 2" }).click();
  await samplePending;
  await expect(
    page.getByRole("heading", { name: "Review the sample spread" }),
  ).toBeVisible();
  await expect(page.getByTestId("sample-spread-text")).toHaveText(
    "Spread 7 moves the adventure forward while preserving the family's idea.",
  );
  await expect(page.getByAltText("Approved character reference")).toBeVisible();
  await page.getByText("What we’ll keep consistent in every picture").click();
  await expect(
    page.getByRole("heading", { name: "Main character" }),
  ).toBeVisible();
  await expect(
    page.getByText(
      /We’ll use the .* art style and these colors across every page/,
    ),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Words will be added separately, not drawn into the picture.",
      { exact: false },
    ),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/visual-sample-spread.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByTestId("sample-spread-text")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/visual-sample-spread-narrow.png",
    fullPage: true,
  });

  await page
    .getByRole("button", { name: "Approve this visual direction" })
    .click();
  await expect(
    page.getByText("Visual direction approved and saved."),
  ).toBeVisible();
  await expect(page.getByText("Your book’s look is approved.")).toBeVisible();
  await page.getByRole("link", { name: "Save and exit" }).click();
  await expect(page.getByText("Approved", { exact: true })).toHaveCount(4);
  await expect(
    page.getByRole("link", { name: "Preview the book plan" }),
  ).toBeVisible();

  const decision = JSON.parse(
    await readFile(
      join(testProjectRoot, projectId ?? "", "visual-decision.json"),
      "utf8",
    ),
  ) as { status?: unknown };
  expect(decision.status).toBe("approved");

  await rm(join(testProjectRoot, projectId ?? ""), {
    recursive: true,
    force: true,
  });
});

test("reuses an approved character in another book without creating new character drafts", async ({
  page,
}) => {
  test.setTimeout(90_000);
  await rm(testCharacterRoot, { recursive: true, force: true });

  const firstProjectId = await createApprovedFixtureStory(
    page,
    "First Milo library book",
    "Milo follows a moon kite before bedtime.",
  );
  await approveFixtureVisual(page, firstProjectId ?? "");

  const secondProjectId = await createApprovedFixtureStory(
    page,
    "Second Milo library book",
    "Milo brings the moon kite to a garden picnic.",
  );
  await page.goto(`/projects/${secondProjectId}/look`);
  await page
    .getByRole("button", { name: "Create the visual story plan" })
    .click();
  await page
    .getByRole("button", { name: "Yes, continue to the character" })
    .click();

  await expect(
    page.getByRole("heading", { name: "Reuse a saved character" }),
  ).toBeVisible();
  await expect(
    page.getByText("skips three new character drafts"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reuse Milo" }).first().click();
  await expect(
    page.getByText("The saved character was copied into this book."),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Review the sample spread" }),
  ).toBeVisible();

  await expect(
    readFile(
      join(testProjectRoot, secondProjectId ?? "", "selected-character.json"),
      "utf8",
    ).then((value) => JSON.parse(value) as { librarySource?: unknown }),
  ).resolves.toMatchObject({ librarySource: expect.any(Object) });
  await expect(
    readFile(
      join(testProjectRoot, secondProjectId ?? "", "character-designs.json"),
      "utf8",
    ),
  ).rejects.toThrow();

  await Promise.all([
    rm(join(testProjectRoot, firstProjectId ?? ""), {
      recursive: true,
      force: true,
    }),
    rm(join(testProjectRoot, secondProjectId ?? ""), {
      recursive: true,
      force: true,
    }),
    rm(testCharacterRoot, { recursive: true, force: true }),
  ]);
});

test("shows resumable per-page production, revises one page, and preserves its siblings without model tokens", async ({
  page,
}) => {
  test.setTimeout(180_000);
  const projectId = await createApprovedFixtureStory(
    page,
    "Fixture full-book journey",
    "A moon kite flies away before bedtime.",
  );
  await approveFixtureVisual(page, projectId ?? "");
  await page.getByRole("link", { name: "Review the book plan" }).click();

  await expect(
    page.getByRole("heading", {
      name: "Make the complete book, one saved page at a time.",
    }),
  ).toBeVisible();
  await expect(
    page.getByText("16 pages remain in this sequential job"),
  ).toBeVisible();
  await expect(page.getByText("$2.88")).toBeVisible();
  await expect(page.getByText("$3.00")).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Preview all 16 pages before image generation",
    }),
  ).toBeVisible();
  await expect(page.locator('[data-testid^="plan-card-"]')).toHaveCount(16);
  await expect(
    page.getByRole("button", { name: "Start full-book production" }),
  ).toHaveCount(0);
  await page
    .getByText("Open the one-spread-at-a-time wireframe reader")
    .click();
  await expect(page.getByTestId("plan-reader-page")).toHaveCount(16);

  const plannedSpread = page.getByTestId("plan-card-story-07");
  await plannedSpread.getByText("Adjust this page plan").click();
  await plannedSpread
    .getByLabel("Planned illustration")
    .fill(
      "A wide bedtime scene with Milo reaching toward the silver moon kite above the rooftops.",
    );
  await plannedSpread.getByRole("button", { name: "Save page plan" }).click();
  await expect(
    page.getByText("The page plan is saved as a new revision.", {
      exact: false,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Approve this book plan" }).click();
  await expect(
    page.getByText("The zero-cost book plan is approved.", { exact: false }),
  ).toBeVisible();
  await expect(
    page
      .getByTestId("plan-card-story-07")
      .getByText(
        "A wide bedtime scene with Milo reaching toward the silver moon kite above the rooftops.",
      )
      .first(),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/book-plan-preview.png",
    fullPage: true,
  });

  const generationFinished = page.waitForURL("**/book?result=saved");
  await page
    .getByRole("button", { name: "Start full-book production" })
    .click();
  await expect(
    page.getByRole("button", { name: "Making the book…" }),
  ).toBeDisabled();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "New pages are saved one at a time" }),
  ).toBeVisible();
  await expect
    .poll(async () => {
      try {
        const job = JSON.parse(
          await readFile(
            join(testProjectRoot, projectId ?? "", "book-production-job.json"),
            "utf8",
          ),
        ) as { status?: unknown; completedUnitIds?: unknown[] };
        return job.status === "in_progress"
          ? (job.completedUnitIds?.length ?? 0)
          : -1;
      } catch {
        return -1;
      }
    })
    .toBeGreaterThan(0);

  const recoveryPage = await page.context().newPage();
  await recoveryPage.goto(`/projects/${projectId}/book`);
  await expect(recoveryPage.getByText("Persisted job")).toBeVisible();
  await expect(
    recoveryPage.getByText("Generation is active in this app."),
  ).toBeVisible();
  await expect(
    recoveryPage.getByRole("button", { name: "Resume after interruption" }),
  ).toHaveCount(0);
  await expect(recoveryPage.getByText(/of 16 pages saved/)).toBeVisible();
  await recoveryPage
    .getByRole("button", { name: "Stop after the current page" })
    .click();
  await expect(
    recoveryPage.getByText("Production will pause before the next page."),
  ).toBeVisible();
  await generationFinished;

  const pausedJob = JSON.parse(
    await readFile(
      join(testProjectRoot, projectId ?? "", "book-production-job.json"),
      "utf8",
    ),
  ) as { status?: unknown; completedUnitIds?: unknown[] };
  expect(pausedJob.status).toBe("paused");
  expect(pausedJob.completedUnitIds?.length).toBeGreaterThan(0);
  expect(pausedJob.completedUnitIds?.length).toBeLessThan(16);
  await recoveryPage.close();

  await expect(
    page.getByRole("button", { name: "Resume with the next page" }),
  ).toBeVisible();
  const resumeFinished = page.waitForEvent("framenavigated", {
    predicate: (frame) => frame === page.mainFrame(),
  });
  await page.getByRole("button", { name: "Resume with the next page" }).click();
  await expect(
    page.getByRole("button", { name: "Resuming the book…" }),
  ).toBeDisabled();
  await resumeFinished;
  await expect(
    page.getByRole("heading", { name: "Production preflight passed" }),
  ).toBeVisible();
  await expect(page.getByTestId("saved-book-page")).toHaveCount(16);
  await expect(
    page.getByText("Story spread 13", { exact: true }).first(),
  ).toBeVisible();
  await expect(
    page.getByText("Closing page", { exact: true }).first(),
  ).toBeVisible();

  const siblingBefore = await readFile(
    join(testProjectRoot, projectId ?? "", "book-page-story-06.json"),
    "utf8",
  );
  const spreadSeven = page.locator("#story-07");
  await spreadSeven.getByText("Edit the separate text layer").click();
  await spreadSeven
    .getByLabel("Page text")
    .fill("Milo held the silver string while the moon kite hummed above him.");
  await spreadSeven.getByRole("button", { name: "Save page text" }).click();
  await expect(page.getByTestId("book-text-story-07")).toHaveText(
    "Milo held the silver string while the moon kite hummed above him.",
  );

  const revisedSpreadSeven = page.locator("#story-07");
  await revisedSpreadSeven.getByText("Regenerate only this image").click();
  await revisedSpreadSeven
    .getByLabel("What should change?")
    .fill("Make the silver moon kite larger in the sky.");
  await revisedSpreadSeven
    .getByLabel("What must stay exactly the same?")
    .fill("Keep Milo, his round glasses, and the separate page text.");
  await revisedSpreadSeven
    .getByRole("button", { name: "Regenerate this page image" })
    .click();
  await expect(
    page.getByText("Every sibling page remains unchanged."),
  ).toBeVisible();
  expect(
    await readFile(
      join(testProjectRoot, projectId ?? "", "book-page-story-06.json"),
      "utf8",
    ),
  ).toBe(siblingBefore);
  await page.getByRole("button", { name: "Approve the complete book" }).click();
  await expect(
    page.getByText(
      "The complete book is approved using the current revisions of all 16 pages.",
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "The complete book is approved" }),
  ).toBeVisible();

  const productionJob = JSON.parse(
    await readFile(
      join(testProjectRoot, projectId ?? "", "book-production-job.json"),
      "utf8",
    ),
  ) as { estimatedSpentCostUsd?: unknown; status?: unknown };
  expect(productionJob).toMatchObject({
    estimatedSpentCostUsd: 3.06,
    status: "completed",
  });
  await expect(
    page.getByText("This estimate is above the $3.00"),
  ).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/full-book-review-narrow.png",
    fullPage: true,
  });

  await page.setViewportSize({ width: 1280, height: 900 });
  await page
    .getByRole("link", {
      name: "Read the approved book and download PDF",
    })
    .click();
  await expect(
    page.getByRole("heading", { name: "Fixture full-book journey" }),
  ).toBeVisible();
  await expect(page.getByText("Page 1 of 16:")).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/fullscreen-reader-narrow.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(
    page.getByRole("button", { name: "Previous page" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Next page" }).click();
  await expect(page.getByText("Page 2 of 16:")).toBeVisible();
  await page.keyboard.press("End");
  await expect(page.getByText("Page 16 of 16:")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Finish and share feedback" }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/fullscreen-reader.png",
    fullPage: true,
  });

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download landscape PDF" }).click();
  await expect(
    page.getByRole("button", { name: "Rendering your PDF…" }),
  ).toBeDisabled();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("storybook-proof.pdf");
  const downloadedPath = await download.path();
  expect(downloadedPath).not.toBeNull();
  expect((await readFile(downloadedPath ?? "")).subarray(0, 4).toString()).toBe(
    "%PDF",
  );
  await expect(page.locator("#pdf-download-status")).toContainText(
    "PDF downloaded",
  );
  expect(
    (await readFile(join(testProjectRoot, projectId ?? "", "proof.pdf")))
      .subarray(0, 4)
      .toString(),
  ).toBe("%PDF");

  await page.getByLabel("Favorite part").fill("The moon kite came home.");
  await page
    .getByLabel("Was anything confusing? (optional)")
    .fill("We wondered who opened the window.");
  await page
    .getByLabel("How much did the book feel like your original idea? (1–5)")
    .selectOption("5");
  await page.getByLabel("Reread interest").selectOption("yes");
  await page
    .getByLabel("Interest in another story or sequel")
    .selectOption("maybe");
  await page.getByRole("button", { name: "Save reading feedback" }).click();
  await expect(page.getByText("Reading feedback saved locally.")).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "One clear record for this family session",
    }),
  ).toBeVisible();
  await expect(page.getByText("$3.06")).toBeVisible();
  await expect(page.getByText("5/5")).toBeVisible();
  const feedback = JSON.parse(
    await readFile(
      join(testProjectRoot, projectId ?? "", "feedback.json"),
      "utf8",
    ),
  ) as { completion?: unknown; rereadInterest?: unknown };
  expect(feedback).toMatchObject({
    completion: "finished",
    rereadInterest: "yes",
  });

  await rm(join(testProjectRoot, projectId ?? ""), {
    recursive: true,
    force: true,
  });
});

test("preserves completed book pages when one production request fails", async ({
  page,
}) => {
  test.setTimeout(75_000);
  const projectId = await createApprovedFixtureStory(
    page,
    "Fixture production failure",
    "A moon kite flies away before bedtime.",
    "Fixture production failure; keep Milo's round glasses and the silver moon kite.",
  );
  await approveFixtureVisual(page, projectId ?? "");
  await page.getByRole("link", { name: "Review the book plan" }).click();
  await page.getByRole("button", { name: "Approve this book plan" }).click();
  await expect(
    page.getByText("The zero-cost book plan is approved.", { exact: false }),
  ).toBeVisible();
  const failedResponse = page.waitForResponse(
    (response) =>
      response.url().includes(`/projects/${projectId}/book/production`) &&
      response.request().method() === "POST",
  );
  await page
    .getByRole("button", { name: "Start full-book production" })
    .click();
  await failedResponse;
  await expect(
    page.getByText("Every completed page is still saved", { exact: false }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByText("Story spread 3 did not finish.")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Retry the failed page" }),
  ).toBeVisible();
  await expect(page.getByTestId("saved-book-page")).toHaveCount(4);
  const failedJob = JSON.parse(
    await readFile(
      join(testProjectRoot, projectId ?? "", "book-production-job.json"),
      "utf8",
    ),
  ) as { failedUnitId?: unknown; completedUnitIds?: unknown[] };
  expect(failedJob).toMatchObject({
    failedUnitId: "story-03",
    completedUnitIds: ["cover", "title-page", "story-01", "story-02"],
  });

  await rm(join(testProjectRoot, projectId ?? ""), {
    recursive: true,
    force: true,
  });
});

test("preserves the approved story when visual generation fails", async ({
  page,
}) => {
  const projectId = await createApprovedFixtureStory(
    page,
    "Fixture visual failure",
    "Fixture image failure",
  );
  await page.getByRole("link", { name: "Choose the visual identity" }).click();
  await page
    .getByRole("button", { name: "Create the visual story plan" })
    .click();
  await page
    .getByRole("button", { name: "Yes, continue to the character" })
    .click();
  await page
    .getByRole("button", { name: "Create three character designs" })
    .click();

  await expect(
    page.getByText(
      "The visual draft did not finish. Your approved story and the last saved visual artifact are still safe.",
      { exact: false },
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Retry three character designs" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Save and exit" }).click();
  await expect(
    page.getByText("Needs attention", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Retry character designs" }),
  ).toBeVisible();

  const storyDecision = JSON.parse(
    await readFile(
      join(testProjectRoot, projectId ?? "", "story-decision.json"),
      "utf8",
    ),
  ) as { status?: unknown };
  expect(storyDecision.status).toBe("approved");

  await rm(join(testProjectRoot, projectId ?? ""), {
    recursive: true,
    force: true,
  });
});
