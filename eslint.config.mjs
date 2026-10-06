import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default [
  {
    ignores: [
      'build/',
      'android/',
      'ios/',
      'dist/',
      'web-build/',
      'node_modules/',
      'coverage/',
      '.expo/',
      '.expo-shared/',
      'babel.config.js',
      'webpack.config.js',
      'scripts/',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.config.js', 'babel.config.js'],
    languageOptions: {
      sourceType: 'commonjs',
    },
    rules: {
      'no-undef': 'off',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': 'error',
      'react/prop-types': 'off',
      // Permitir require en archivos .tsx (React Native assets)
      '@typescript-eslint/no-require-imports': 'off',
      // Desactivar no-undef (TS ya lo cubre)
      'no-undef': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];
