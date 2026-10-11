import { defineConfig } from '@playwright/test';

const port = process.env.TEST_PORT ?? '4174';
const baseURL = `http://127.0.0.1:${port}`;
export default defineConfig({
  testDir: './e2e',
  // Current scope: causal chapters replace the retired fixed-order throughline.
  // Historical scripts and their evidence remain in the repository (see e2e/README).
  testMatch: [
    '**/minigames-vocab.spec.ts',
    '**/adventure.spec.ts',
    '**/m22-boundaries.spec.ts',
    '**/m22-growth.spec.ts',
    '**/wp-dual-growth.spec.ts',
    '**/minigames.spec.ts',
    '**/wp-dual-mini-course.spec.ts',
  ],
  timeout: 60000,
  expect: { timeout: 6000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    browserName: process.env.BROWSER === 'webkit' ? 'webkit' : 'chromium',
    storageState: process.env.CI
      ? {
          cookies: [],
          origins: [
            {
              origin: baseURL,
              localStorage: [{ name: 'tabby.foodtruck.lowGraphics', value: 'true' }],
            },
          ],
        }
      : undefined,
    actionTimeout: 12000,
    viewport: { width: 390, height: 844 },
    video: {
      mode: process.env.CI ? 'retain-on-failure' : 'on',
      size: { width: 1024, height: 1024 },
    },
    screenshot: 'only-on-failure',
    trace: 'off',
  },
  webServer: {
    command: process.env.CI
      ? `npm run preview -- --port ${port} --strictPort`
      : `npm run build && npm run preview -- --port ${port} --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
});
