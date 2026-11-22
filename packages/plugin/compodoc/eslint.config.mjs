import jsoncEslintParser from 'jsonc-eslint-parser';
import baseConfig from '../../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['package.json', 'generators.json', 'executors.json'],
    rules: {
      '@nx/nx-plugin-checks': 'error',
    },
    languageOptions: {
      parser: jsoncEslintParser,
    },
  },
  {
    ignores: [
      'node_modules/**',
      'compodoc/**',
      'docs/**',
      'coverage/**',
      'dist/**',
      '.nx/**',
      '.angular/**',
      'node_models/**',
    ],
  },
];
