import baseConfig from '../../../eslint.config.mjs';

export default [
  ...baseConfig,
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
