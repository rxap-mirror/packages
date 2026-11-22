import baseConfig from '../../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    ignores: ['docs/**', 'dist/**', 'coverage/**', 'node_modules/**'],
  },
];
