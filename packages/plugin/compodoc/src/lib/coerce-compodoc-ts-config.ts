import { Tree } from '@nx/devkit';
import { CoerceArrayItems } from '@rxap/utilities';
import {
  GetProject,
  GetProjectRoot,
  IsAngularProject,
  IsNestJsProject,
  UpdateTsConfigJson,
} from '@rxap/workspace-utilities';

export function CoerceCompodocTsConfig(tree: Tree, projectName: string, include: string[] = ['src/**/*.ts'], exclude?: string[]) {

  const projectRoot = GetProjectRoot(tree, projectName);
  const project = GetProject(tree, projectName);

  if (IsAngularProject(project) || projectName === 'workspace') {
    exclude ??= [ '**/*.stories.ts', '**/*.spec.ts', '**/*.cy.ts' ];
  }

  if (IsNestJsProject(project)) {
    exclude ??= [ '**/*.spec.ts' ];
  }

  UpdateTsConfigJson(tree, tsConfig => {
    tsConfig.extends ??= projectName === 'workspace' ? './tsconfig.base.json' : './tsconfig.json';
    tsConfig.compilerOptions ??= {};
    if (IsAngularProject(project) || projectName === 'workspace') {
      tsConfig.compilerOptions.types ??= [];
      CoerceArrayItems(tsConfig.compilerOptions.types, [ '@angular/localize' ]);
    }
    if (include?.length) {
      tsConfig.include ??= [];
      CoerceArrayItems(tsConfig.include, include);
    }
    if (exclude?.length) {
      tsConfig.exclude ??= [];
      CoerceArrayItems(tsConfig.exclude, exclude);
    }
  }, { infix: 'compodoc', basePath: projectRoot, create: true });

  UpdateTsConfigJson(tree, tsConfig => {
    tsConfig.references ??= [];
    CoerceArrayItems(tsConfig.references, [{ path: './tsconfig.compodoc.json' }], (a, b) => a.path === b.path);
  }, { basePath: projectRoot });

}
