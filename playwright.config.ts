import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  outputDir: "test-results",
  use: {
    baseURL: "http://127.0.0.1:3100",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command:
      "KIDS_BOOK_NEXT_DIST_DIR=.next-e2e KIDS_BOOK_PROJECT_ROOT=test-results/projects KIDS_BOOK_TEXT_PROVIDER=fixture KIDS_BOOK_IMAGE_PROVIDER=fixture KIDS_BOOK_FIXTURE_DELAY_MS=2000 pnpm dev --hostname 127.0.0.1 --port 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: false,
  },
});
