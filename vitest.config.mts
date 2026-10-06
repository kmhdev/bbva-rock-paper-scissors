import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['**/*.test.ts'],
    exclude: ['node_modules', 'dist', 'web-build', 'e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: [
        'services/gameLogicService.ts',
        'services/machineService.ts',
        'services/scoreService.ts',
        'services/themeHelpers.ts',
        'services/webDocumentPresentation.ts',
        'store/gameStore.ts',
        'utils/vibration.ts',
      ],
      exclude: ['**/*.test.*', '**/*.styles.*', '**/+not-found.tsx'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
