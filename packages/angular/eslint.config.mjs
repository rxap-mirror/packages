import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/openapi/**/*.ts'],
    rules: {
      '@typescript-eslint/no-empty-interface': 'off',
    },
  },
  {
    files: [
      '**/*.mixin.ts',
      '**/*.directive.ts',
      '**/*.remote-method.ts',
      '**/*.data-source.ts',
      '**/*.mixin.spec.ts',
    ],
    rules: {
      '@typescript-eslint/no-unsafe-declaration-merging': 'off',
    },
  },
  ...nx.configs['flat/angular'],
  {
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/no-output-rename': 'warn',
      '@angular-eslint/no-input-rename': 'warn',
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'rxap',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'rxap',
          style: 'kebab-case',
        },
      ],
      '@angular-eslint/prefer-inject': 'off',
    },
  },
  {
    files: ['**/*.method.ts', '**/*.data-source.ts', '**/*.form.ts'],
    rules: {
      '@angular-eslint/contextual-lifecycle': 'off',
    },
  },
  ...nx.configs['flat/angular-template'],
  {
    files: ['**/*.html'],
    rules: {
      '@angular-eslint/template/prefer-control-flow': 'off',
    },
  },
  {
    files: ['**/*.config.js', '**/tailwind.config.js'],
    rules: {
      '@nx/enforce-module-boundaries': 'off',
    },
  },
  {
    files: ['**/test-setup.ts'],
    rules: {
      '@nx/enforce-module-boundaries': 'off',
    },
  },
  {
    // Newly enabled by the angular-eslint v22 presets (ESLint 9 migration); not enforced before the upgrade.
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/prefer-on-push-component-change-detection': 'off',
    },
  },
  {
    files: ['**/*.html'],
    rules: {
      '@angular-eslint/template/elements-content': 'off',
      '@angular-eslint/template/interactive-supports-focus': 'off',
      '@angular-eslint/template/click-events-have-key-events': 'off',
      '@angular-eslint/template/label-has-associated-control': 'off',
      '@angular-eslint/template/alt-text': 'off',
    },
  },
];
