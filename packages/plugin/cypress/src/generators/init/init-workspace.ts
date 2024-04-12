import {
  readNxJson,
  Tree,
  updateNxJson,
} from '@nx/devkit';
import { CoerceArrayItems } from '@rxap/utilities';
import {
  AddPackageJsonDevDependency,
  CoerceFilesStructure,
  CoerceTarget,
  GetProjectRoot,
  GetProjectSourceRoot,
  Strategy,
  UpdateTsConfigJson,
  UpdateTsConfigPaths,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import { InitGeneratorSchema } from './schema';

export async function initWorkspace(tree: Tree, options: InitGeneratorSchema) {
  console.log('init cypress workspace');

  await AddPackageJsonDevDependency(tree, '@jsdevtools/coverage-istanbul-loader', 'latest', { soft: true });
  await AddPackageJsonDevDependency(tree, '@cypress/code-coverage', 'latest', { soft: true });

  const projectSourceRoot = GetProjectSourceRoot(tree, 'workspace-tools');

  CoerceFilesStructure(tree, {
    srcFolder: join(__dirname, 'files', 'cypress'),
    target: join(projectSourceRoot, 'cypress'),
    overwrite: options.overwrite,
  });

  UpdateTsConfigPaths(tree, paths => {
    paths['workspace/cypress/commands'] = [ 'tools/src/cypress/commands.ts'];
    paths['workspace/cypress/support'] = [ 'tools/src/cypress/support.ts'];
    paths['workspace/cypress/config'] = [ 'tools/src/cypress/component-testing-preset.ts'];
  });

  const projectRoot = GetProjectRoot(tree, 'workspace-tools');
  UpdateTsConfigJson(tree, tsConfig => {
    tsConfig.exclude ??= [];
    CoerceArrayItems(tsConfig.exclude, [ 'src/cypress/**/*' ]);
  }, { infix: 'lib', basePath: projectRoot });
  UpdateTsConfigJson(tree, tsConfig => {
    tsConfig.exclude ??= [];
    CoerceArrayItems(tsConfig.exclude, [ 'src/cypress/**/*' ]);
  }, { infix: 'spec', basePath: projectRoot });

  const nxJson = readNxJson(tree);
  CoerceTarget(nxJson, 'component-test', {
    configurations: {
      open: {
        watch: true,
      }
    }
  }, Strategy.OVERWRITE);
  updateNxJson(tree, nxJson);


}
