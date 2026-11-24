import baseConfig from '../../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**'],
  },
];
