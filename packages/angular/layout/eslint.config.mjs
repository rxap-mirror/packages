import * as jsoncEslintParser from 'jsonc-eslint-parser';
import baseConfig from '../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['package.json', 'generators.json'],
    rules: {
      '@nx/nx-plugin-checks': 'error',
    },
    languageOptions: {
      parser: jsoncEslintParser,
    },
  },
  {
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/prefer-standalone': 'off',
    },
  },
  {
    ignores: [
      'compodoc/**',
      'docs/**',
      'dist/**',
      'coverage/**',
      'node_modules/**',
      '.angular/**',
    ],
  },
];
