import { defineConfig, devices } from "@playwright/test";

const CLIENT_URL = "http://localhost:3000";
const API_URL = "http://localhost:8001";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: CLIENT_URL,
    trace: "on-first-retry",
    // The app only loads shows once it has a location, so every test runs as a
    // visitor who has granted it.
    geolocation: { latitude: 43.6532, longitude: -79.3832 },
    permissions: ["geolocation"],
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "npm run dev",
      cwd: "../server",
      url: `${API_URL}/`,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command: "npm start",
      cwd: "../client",
      env: { BROWSER: "none" },
      url: CLIENT_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
  ],
});
