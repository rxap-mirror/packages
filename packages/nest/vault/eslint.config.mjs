import * as jsoncEslintParser from 'jsonc-eslint-parser';
import baseConfig, { dependencyChecksOptions } from '../../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/package.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        dependencyChecksOptions(['@nestjs/testing']),
      ],
    },
    languageOptions: {
      parser: jsoncEslintParser,
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
    ],
  },
];
