import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // En entornos sin descarga de navegadores, reutiliza el Chrome del
        // sistema: E2E_CHANNEL=chrome (o msedge)
        ...(process.env.E2E_CHANNEL ? { channel: process.env.E2E_CHANNEL as 'chrome' } : {}),
      },
    },
  ],
  webServer: {
    command: 'npx -y serve dist -l 4173 -s',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
