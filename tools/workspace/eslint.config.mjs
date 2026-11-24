import * as jsoncEslintParser from 'jsonc-eslint-parser';
import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['package.json', 'executors.json'],
    rules: {
      '@nx/nx-plugin-checks': 'error',
    },
    languageOptions: {
      parser: jsoncEslintParser,
    },
  },
  {
    // workspace-internal plugin, never published: it runs with the root node_modules
    files: ['package.json'],
    rules: {
      '@nx/dependency-checks': 'off',
    },
  },
  {
    ignores: ['docs/**'],
  },
];
