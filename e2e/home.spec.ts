import { expect, test } from "@playwright/test";

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
