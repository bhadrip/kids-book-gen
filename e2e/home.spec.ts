import { expect, test } from "@playwright/test";
import { rm } from "node:fs/promises";
import { join } from "node:path";

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

  await rm(join(process.cwd(), "data", "projects", projectId ?? ""), {
    recursive: true,
    force: true,
  });
});
