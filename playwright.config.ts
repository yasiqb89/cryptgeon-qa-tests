import { defineConfig, devices, type ReporterDescription } from '@playwright/test'

const reporter: ReporterDescription[] = [['list'], ['html', { open: 'never' }]]

if (process.env.PLAYWRIGHT_JSON_OUTPUT_NAME) {
  reporter.push(['json', { outputFile: process.env.PLAYWRIGHT_JSON_OUTPUT_NAME }])
}

export default defineConfig({
  // Folder where Playwright looks for test spec files.
  testDir: './tests',

  // Maximum time allowed for one test before it fails.
  timeout: 30_000,

  // Maximum time Playwright waits for each assertion to pass.
  expect: {
    timeout: 10_000,
  },

  // Shared browser settings used by every test.
  use: {
    // Target environment; can be overridden from the command line.
    baseURL: process.env.CRYPTGEON_BASE_URL ?? 'http://onetimeshare.gsfleet.io',

    // Keeps a trace only when a test fails, useful for debugging.
    trace: 'retain-on-failure',

    // Captures screenshots only for failed tests.
    screenshot: 'only-on-failure',

    // Keeps video recordings only for failed tests.
    video: 'retain-on-failure',
  },

  // Shows results in the terminal, creates an HTML report, and can optionally write JSON for automation.
  reporter,

  // Browser matrix; currently limited to Chromium for a fast live demo.
  projects: [
    {
      name: 'chromium',

      // Uses Playwright's standard desktop Chrome browser profile.
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
