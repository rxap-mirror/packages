import { Tree } from '@nx/devkit';
import { CoerceArrayItems } from '@rxap/utilities';
import {
  GetProjectRoot,
  UpdateTsConfigJson,
} from '@rxap/workspace-utilities';

export async function CoerceCompodocTsConfig(tree: Tree, projectName: string, include: string[] = ['src/**/*.ts'], exclude: string[] = ['**/*.stories.ts', '**/*.spec.ts', '**/*.cy.ts']) {

  const projectRoot = GetProjectRoot(tree, projectName);

  await UpdateTsConfigJson(tree, tsConfig => {
    tsConfig.extends ??= './tsconfig.json';
    tsConfig.include ??= [];
    tsConfig.exclude ??= [];
    CoerceArrayItems(tsConfig.include, include);
    CoerceArrayItems(tsConfig.exclude, exclude);
  }, { infix: 'compodoc', basePath: projectRoot, create: true });

  await UpdateTsConfigJson(tree, tsConfig => {
    tsConfig.references ??= [];
    CoerceArrayItems(tsConfig.references, [{ path: './tsconfig.compodoc.json' }], (a, b) => a.path === b.path);
  }, { basePath: projectRoot });

}
