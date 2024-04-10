import { Tree } from '@nx/devkit';
import {
  AddPackageJsonDevDependency,
  CoerceFilesStructure,
  JSON_MERGE_STRATEGY,
  UpdatePackageJson,
  YAML_MERGE_STRATEGY,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import { coerceSharedServiceConfiguration } from './coerce-shared-service-configuration';
import { coerceSharedServiceUserConfig } from './coerce-shared-service-user-config';
import { InitGeneratorSchema } from './schema';
import { updateTargetDefaults } from './update-target-defaults';

export async function initWorkspace(tree: Tree, options: InitGeneratorSchema) {
  console.log('init application workspace');

  await AddPackageJsonDevDependency(tree, '@rxap/plugin-docker', 'latest', { soft: true });
  await AddPackageJsonDevDependency(tree, '@rxap/plugin-workspace', 'latest', { soft: true });
  await AddPackageJsonDevDependency(tree, 'jest-junit', 'latest', { soft: true });

  await UpdatePackageJson(tree, packageJson => {
    packageJson['jest-junit'] ??= {};
    packageJson['jest-junit'].uniqueOutputName = true;
  });

  updateTargetDefaults(tree);

  if (!options.standalone) {
    CoerceFilesStructure(tree, {
      srcFolder: join(__dirname, 'files', 'general'),
      target: '',
      overwrite: options.overwrite,
      mergeStrategies: [ YAML_MERGE_STRATEGY, JSON_MERGE_STRATEGY ],
    });
    coerceSharedServiceUserConfig(tree);
    coerceSharedServiceConfiguration(tree);
  }

  CoerceFilesStructure(tree, {
    srcFolder: join(__dirname, 'files', 'initial'),
    target: '',
    overwrite: false,
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
