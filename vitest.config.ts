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
        'services/**/*.ts',
        'store/**/*.ts',
        'utils/**/*.ts',
        'constants/**/*.ts',
        'context/**/*.tsx',
        'components/**/*.tsx',
        'app/**/*.tsx',
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
