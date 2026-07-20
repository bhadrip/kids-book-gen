import { expect, test } from "@playwright/test";
import { readFile, rm } from "node:fs/promises";
import { join } from "node:path";

const testProjectRoot = join(process.cwd(), "test-results", "projects");

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
  await expect(
    page.getByRole("button", { name: "Generate three directions" }),
  ).toBeVisible();

  await rm(join(testProjectRoot, projectId ?? ""), {
    recursive: true,
    force: true,
  });
});

test("revises directions, generates a story, approves it, and reopens it without model tokens", async ({
  page,
}) => {
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
    reopenedOverview.getByText("In progress", { exact: true }),
  ).toBeVisible();
  await expect(
    reopenedOverview.getByRole("link", { name: "Check generation status" }),
  ).toBeVisible();
  await reopenedOverview.close();
  await expect(
    page.getByRole("heading", { name: "Three ways this story could go" }),
  ).toBeVisible();

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
  await firstCard
    .getByRole("button", { name: "Choose this direction" })
    .click();
  await expect(
    firstCard.getByRole("button", { name: "Generating this story…" }),
  ).toBeDisabled();

  await expect(
    page.getByRole("heading", {
      name: "The Moon Kite Mission — Make them funnier",
    }),
  ).toBeVisible();
  await expect(page.getByText("Story revision 1")).toBeVisible();
  await expect(page.getByText("Spread 13:")).toBeVisible();
  await page.getByLabel("What should change?").fill("Add one silly obstacle");
  await page.getByRole("button", { name: "Revise this story" }).click();
  await expect(
    page.getByRole("button", { name: "Revising this story…" }),
  ).toBeDisabled();
  await expect(page.getByText("Story revision 2")).toBeVisible();
  await expect(page.getByText("Your revised story is ready.")).toBeVisible();
  await page.getByRole("button", { name: "Approve this story" }).click();
  await expect(page.getByText("Story approved and saved.")).toBeVisible();

  await page.goto(`/projects/${projectId}`);
  await expect(page.getByText("Approved", { exact: true })).toHaveCount(3);
  await page.getByRole("link", { name: "View approved story" }).click();
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
