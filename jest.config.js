module.exports = {
  preset: 'jest-expo',
  setupFiles: ['./jest.setup.js'],
  testMatch: ['**/*.test.tsx'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/web-build/'],
  collectCoverageFrom: [
    'app/**/*.tsx',
    'components/**/*.tsx',
    'context/**/*.tsx',
    '!**/*.test.tsx',
    '!**/*.styles.ts',
    '!app/+not-found.tsx',
  ],
  coverageThreshold: {
    global: {
      lines: 80,
      functions: 80,
      branches: 70,
      statements: 80,
    },
  },
};
