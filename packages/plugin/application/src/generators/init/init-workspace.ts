import { Tree } from '@nx/devkit';
import {
  AddPackageJsonDevDependency,
  CoerceFilesStructure,
  JSON_MERGE_STRATEGY,
  YAML_MERGE_STRATEGY,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import { InitGeneratorSchema } from './schema';
import { updateTargetDefaults } from './update-target-defaults';

export async function initWorkspace(tree: Tree, options: InitGeneratorSchema) {
  console.log('init application workspace');

  await AddPackageJsonDevDependency(tree, '@rxap/plugin-docker', 'latest', { soft: true });
  await AddPackageJsonDevDependency(tree, '@rxap/plugin-workspace', 'latest', { soft: true });

  updateTargetDefaults(tree);

  CoerceFilesStructure(tree, {
    srcFolder: join(__dirname, 'files', 'general'),
    target: '',
    overwrite: options.overwrite,
    mergeStrategies: [ YAML_MERGE_STRATEGY, JSON_MERGE_STRATEGY ],
  });

  if (options.authentik) {
    CoerceFilesStructure(tree, {
      srcFolder: join(__dirname, 'files', 'authentik'),
      target: '',
      overwrite: options.overwrite,
      mergeStrategies: [ YAML_MERGE_STRATEGY, JSON_MERGE_STRATEGY ],
    });
  }

  if (options.minio) {
    CoerceFilesStructure(tree, {
      srcFolder: join(__dirname, 'files', 'minio'),
      target: '',
      overwrite: options.overwrite,
      mergeStrategies: [ YAML_MERGE_STRATEGY, JSON_MERGE_STRATEGY ],
    });
  }
}
