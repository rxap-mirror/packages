import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import js from '@eslint/js';
import nx from '@nx/eslint-plugin';
import * as jsoncEslintParser from 'jsonc-eslint-parser';

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
  recommendedConfig: js.configs.recommended,
});

/**
 * Options of the `@nx/dependency-checks` rule shared by every publishable project.
 *
 * ESLint replaces (not merges) rule options, so a project that needs extra exceptions re-declares the
 * rule with `dependencyChecksOptions(['extra-package'])` instead of copying this object.
 *
 * @param {string[]} ignoredDependencies project specific packages the rule should not report
 */
export function dependencyChecksOptions(ignoredDependencies = []) {
  return {
    buildTargets: ['build'],
    checkMissingDependencies: true,
    checkObsoleteDependencies: true,
    checkVersionMismatches: true,
    // ng-packagr and tsc (importHelpers) emit tslib helper imports that are not part of the source
    runtimeHelpers: ['tslib'],
    ignoredFiles: [
      '{projectRoot}/eslint.config.{js,cjs,mjs}',
      '{projectRoot}/{vite,vitest,jest}.config.{js,cjs,mjs,ts,mts,cts}',
      '{projectRoot}/**/*.{spec,test}.{ts,tsx}',
      '{projectRoot}/**/test-setup.ts',
    ],
    ignoredDependencies: [
      // the @Showcase decorators are removed from the published package by the prism-strip target (@rxap/plugin-ng-prism)
      '@ng-prism/core',
      ...ignoredDependencies,
    ],
  };
}

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
    files: ['**/*.spec.ts'],
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
  ...nx.configs['flat/typescript'],
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-extra-semi': 'off',
    },
  },
  ...nx.configs['flat/javascript'],
  {
    // rules newly enabled by the ESLint 10 recommended preset; adopting them means touching ~50 existing call sites
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.mjs'],
    rules: {
      'preserve-caught-error': 'off',
      'no-useless-assignment': 'off',
    },
  },
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
    // Every published package must declare what its build output imports: under pnpm's isolated
    // node_modules (and with npm/yarn when hoisting differs) an undeclared dependency does not resolve.
    files: ['**/package.json'],
    rules: {
      '@nx/dependency-checks': ['error', dependencyChecksOptions()],
    },
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
