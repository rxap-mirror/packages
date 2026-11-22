import jsoncEslintParser from 'jsonc-eslint-parser';
import baseConfig from '../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.ts'],
    rules: {
      'no-prototype-builtins': 'warn',
      '@angular-eslint/prefer-standalone': 'off',
    },
  },
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
