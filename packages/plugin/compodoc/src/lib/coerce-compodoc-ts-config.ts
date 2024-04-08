import { Tree } from '@nx/devkit';
import { CoerceArrayItems } from '@rxap/utilities';
import {
  GetProjectRoot,
  UpdateTsConfigJson,
} from '@rxap/workspace-utilities';

export function CoerceCompodocTsConfig(tree: Tree, projectName: string, include: string[] = ['src/**/*.ts'], exclude: string[] = ['**/*.stories.ts', '**/*.spec.ts', '**/*.cy.ts']) {

  const projectRoot = GetProjectRoot(tree, projectName);

  UpdateTsConfigJson(tree, tsConfig => {
    tsConfig.extends ??= './tsconfig.json';
    tsConfig.compilerOptions ??= {};
    tsConfig.compilerOptions.types ??= [];
    CoerceArrayItems(tsConfig.compilerOptions.types, ['@angular/localize']);
    tsConfig.include ??= [];
    tsConfig.exclude ??= [];
    CoerceArrayItems(tsConfig.include, include);
    CoerceArrayItems(tsConfig.exclude, exclude);
  }, { infix: 'compodoc', basePath: projectRoot, create: true });

  if (projectName === 'workspace') {
    UpdateTsConfigJson(tree, tsConfig => {
    tsConfig.extends = `./tsconfig.base.json`;
    tsConfig.include = [];
    tsConfig.exclude = [];
    tsConfig.files = [];
    }, { basePath: projectRoot, create: true });
  }

  UpdateTsConfigJson(tree, tsConfig => {
    tsConfig.references ??= [];
    CoerceArrayItems(tsConfig.references, [{ path: './tsconfig.compodoc.json' }], (a, b) => a.path === b.path);
  }, { basePath: projectRoot });

}
