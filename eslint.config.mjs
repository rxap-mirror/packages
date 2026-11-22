import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import js from '@eslint/js';
import nx from '@nx/eslint-plugin';
import jsoncEslintParser from 'jsonc-eslint-parser';

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
  recommendedConfig: js.configs.recommended,
});

export default [
  ...nx.configs['flat/base'],
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allowCircularSelfDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
            {
              sourceTag: 'schematic',
              notDependOnLibsWithTags: ['generator', 'plugin'],
            },
            {
              sourceTag: 'generator',
              notDependOnLibsWithTags: ['schematic'],
            },
            {
              sourceTag: 'browser',
              notDependOnLibsWithTags: ['node', 'angular', 'nest'],
            },
            {
              sourceTag: 'workspace',
              notDependOnLibsWithTags: ['schematic', 'generator'],
              bannedExternalImports: [
                '@angular-devkit/architect',
                '@angular-devkit/core',
                '@angular-devkit/schematics',
                '@angular/schematics',
              ],
            },
            {
              sourceTag: 'plugin',
              notDependOnLibsWithTags: ['schematic', 'angular', 'nest'],
              bannedExternalImports: [
                '@angular-devkit/architect',
                '@angular-devkit/core',
                '@angular-devkit/schematics',
                '@nrwl/workspace',
              ],
            },
            {
              allSourceTags: ['nest', 'packages'],
              notDependOnLibsWithTags: ['angular'],
            },
            {
              allSourceTags: ['angular', 'packages'],
              notDependOnLibsWithTags: ['nest'],
            },
            {
              allSourceTags: [
                'angular',
                'packages',
                '/^(?!.*\\bmaterial\\b).*$/s',
              ],
              notDependOnLibsWithTags: ['material'],
              bannedExternalImports: ['@angular/material'],
            },
            {
              sourceTag: 'angular:standalone',
              notDependOnLibsWithTags: [
                'schematic',
                'generator',
                'workspace',
                'angular',
                'node',
                'nest',
                'browser',
              ],
              onlyDependOnLibsWithTags: ['scope:utilities'],
            },
            {
              sourceTag: 'standalone',
              notDependOnLibsWithTags: [
                'schematic',
                'generator',
                'workspace',
                'angular',
                'node',
                'nest',
                'browser',
              ],
              onlyDependOnLibsWithTags: ['scope:utilities'],
              bannedExternalImports: [
                '@angular-devkit/schematics',
                '@angular/core',
                '@angular/platform-browser-dynamic',
              ],
            },
            {
              sourceTag: 'scope:core',
              onlyDependOnLibsWithTags: ['scope:utilities'],
            },
            {
              sourceTag: 'scope:utilities',
              onlyDependOnLibsWithTags: ['scope:utilities'],
            },
            {
              sourceTag: 'scope:compose',
              onlyDependOnLibsWithTags: [
                'scope:utilities',
                'scope:core',
                'scope:compose',
                'scope:integration',
              ],
            },
            {
              sourceTag: 'scope:integration',
              onlyDependOnLibsWithTags: ['scope:utilities', 'scope:core'],
            },
            {
              sourceTag: 'angular',
              bannedExternalImports: [
                'xmldom',
                '@nestjs/common',
                '@angular/localize/init',
              ],
            },
            {
              sourceTag: 'nest',
              bannedExternalImports: ['@angular/core'],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.spec.ts', '**/*.cy.ts', '**/*.stories.ts'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allowCircularSelfDependency: true,
          allow: [],
          depConstraints: [],
        },
      ],
    },
  },
  {
    files: ['cypress.config.ts', 'cypress/**'],
    rules: {
      '@nx/enforce-module-boundaries': 'off',
    },
  },
  ...nx.configs['flat/typescript'],
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-extra-semi': 'off',
    },
  },
  ...nx.configs['flat/javascript'],
  {
    files: ['**/*.js', '**/*.jsx'],
    rules: {
      'no-extra-semi': 'off',
    },
  },
  ...compat
    .config({
      env: {
        jest: true,
      },
    })
    .map((config) => ({
      ...config,
      files: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.spec.js', '**/*.spec.jsx'],
      rules: {
        ...config.rules,
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-this-alias': 'off',
        '@typescript-eslint/no-unsafe-declaration-merging': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
      },
    })),
  {
    files: ['**/*.json'],
    // Override or add rules here
    rules: {},
    languageOptions: {
      parser: jsoncEslintParser,
    },
  },
  {
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/prefer-standalone': 'off',
    },
  },
  {
    // Rules newly enabled by the typescript-eslint v8 / ESLint v9 recommended presets (ESLint 9 migration).
    // They were not enforced before the upgrade and are therefore disabled to keep the baseline.
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.js',
      '**/*.jsx',
      '**/*.mjs',
      '**/*.cjs',
    ],
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-namespace': 'off',
    },
  },
  {
    // Newly enabled by the angular-eslint v22 template / OnPush presets used by the Nx flat configs.
    files: ['**/*.ts', '**/*.html'],
    rules: {
      '@angular-eslint/prefer-on-push-component-change-detection': 'off',
      '@angular-eslint/template/elements-content': 'off',
      '@angular-eslint/template/interactive-supports-focus': 'off',
      '@angular-eslint/template/click-events-have-key-events': 'off',
      '@angular-eslint/template/label-has-associated-control': 'off',
      '@angular-eslint/template/alt-text': 'off',
    },
  },
  {
    ignores: [
      'compodoc',
      'docs',
      'coverage',
      'dist',
      '.nx',
      '.angular',
      '!packages/plugin/docs',
      '!packages/plugin/compodoc',
    ],
  },
];
