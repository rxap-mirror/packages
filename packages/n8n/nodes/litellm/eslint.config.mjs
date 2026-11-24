import * as jsoncEslintParser from 'jsonc-eslint-parser';
import baseConfig, { dependencyChecksOptions } from '../../../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/package.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        dependencyChecksOptions(['zod']),
      ],
    },
    languageOptions: {
      parser: jsoncEslintParser,
    },
  },
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**'],
  },
];
