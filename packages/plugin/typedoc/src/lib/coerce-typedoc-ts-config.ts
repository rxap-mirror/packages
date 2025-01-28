import { Tree } from '@nx/devkit';
import { CoerceArrayItems } from '@rxap/utilities';
import {
  GetProject,
  GetProjectRoot,
  IsAngularProject,
  IsNestJsProject,
  IsWorkspaceProject,
  UpdateTsConfigJson,
} from '@rxap/workspace-utilities';

export function CoerceTypedocTsConfig(tree: Tree, projectName: string, include: string[] = ['src/**/*.ts'], exclude?: string[]) {

  const projectRoot = GetProjectRoot(tree, projectName);
  const project = GetProject(tree, projectName);

  if (IsAngularProject(project) || IsWorkspaceProject(project)) {
    exclude ??= [ '**/*.stories.ts', '**/*.spec.ts', '**/*.cy.ts', 'src/test-setup.ts' ];
  }

  if (IsNestJsProject(project)) {
    exclude ??= [ '**/*.spec.ts', 'src/test-setup.ts' ];
  }

  UpdateTsConfigJson(tree, tsConfig => {
    tsConfig.extends ??= IsWorkspaceProject(project) ? './tsconfig.base.json' : './tsconfig.json';
    tsConfig.compilerOptions ??= {};
    if (IsAngularProject(project) || IsWorkspaceProject(project)) {
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
  }, { infix: 'typedoc', basePath: projectRoot, create: true });

  UpdateTsConfigJson(tree, tsConfig => {
    tsConfig.references ??= [];
    CoerceArrayItems(tsConfig.references, [{ path: './tsconfig.typedoc.json' }], (a, b) => a.path === b.path);
  }, { basePath: projectRoot });

}
