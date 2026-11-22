import jsoncEslintParser from 'jsonc-eslint-parser';
import baseConfig from '../../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['package.json', 'executors.json', 'generators.json'],
    rules: {
      '@nx/nx-plugin-checks': 'error',
    },
    languageOptions: {
      parser: jsoncEslintParser,
    },
  },
  {
    ignores: ['docs/**', 'dist/**', 'coverage/**', 'node_modules/**'],
  },
];
