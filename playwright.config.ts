import { defineConfig, devices } from "@playwright/test";

const isPrReview = process.env.PLAYWRIGHT_PR_REVIEW === "1";

export default defineConfig({
  testDir: "./e2e",
  outputDir: "test-results",
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: "http://127.0.0.1:3100",
    screenshot: isPrReview ? "on" : "only-on-failure",
    trace: isPrReview ? "on" : "retain-on-failure",
    video: isPrReview ? "on" : "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command:
      "KIDS_BOOK_NEXT_DIST_DIR=.next-e2e KIDS_BOOK_PROJECT_ROOT=test-results/projects KIDS_BOOK_CHARACTER_LIBRARY_ROOT=test-results/characters KIDS_BOOK_TEXT_PROVIDER=fixture KIDS_BOOK_IMAGE_PROVIDER=fixture KIDS_BOOK_FIXTURE_DELAY_MS=2000 pnpm dev --hostname 127.0.0.1 --port 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: false,
  },
});
