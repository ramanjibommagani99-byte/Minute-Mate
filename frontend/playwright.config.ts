import { defineConfig, devices } from "@playwright/test";

const port = process.env.PLAYWRIGHT_PORT ?? "3000";
const baseURL = `http://127.0.0.1:${port}`;
const channel = process.env.PLAYWRIGHT_CHANNEL;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  workers: process.env.CI ? 2 : 1,
  reporter: "list",
  outputDir: process.env.PLAYWRIGHT_OUTPUT_DIR ?? "./.playwright-results",
  use: { baseURL, trace: "retain-on-failure", ...devices["Desktop Chrome"], ...(channel ? { launchOptions: { channel } } : {}) },
  ...(process.env.PLAYWRIGHT_USE_EXISTING_SERVER === "1" ? {} : {
    webServer: {
      command: `npm run dev -- --hostname 127.0.0.1 --port ${port}`,
      url: baseURL,
      reuseExistingServer: true,
      timeout: 120_000,
    },
  }),
});
