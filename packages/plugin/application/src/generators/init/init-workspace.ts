import { Tree } from '@nx/devkit';
import {
  AddPackageJsonDevDependency,
  CoerceFilesStructure,
  JSON_MERGE_STRATEGY,
  PackageManagerSubstitutions,
  ResolvePackageManagerProfile,
  UpdatePackageJson,
  YAML_MERGE_STRATEGY,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import { coerceDockerCompose } from './coerce-docker-compose';
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

  const substitutions = PackageManagerSubstitutions(ResolvePackageManagerProfile(tree));

  if (!options.standalone) {
    CoerceFilesStructure(tree, {
      srcFolder: join(__dirname, 'files', 'general'),
      target: '',
      overwrite: options.overwrite,
      mergeStrategies: [ YAML_MERGE_STRATEGY, JSON_MERGE_STRATEGY ],
      substitutions,
    });
    coerceDockerCompose(tree);
    coerceSharedServiceUserConfig(tree);
    coerceSharedServiceConfiguration(tree);
  }

  CoerceFilesStructure(tree, {
    srcFolder: join(__dirname, 'files', 'initial'),
    target: '',
    overwrite: false,
    mergeStrategies: [ YAML_MERGE_STRATEGY, JSON_MERGE_STRATEGY ],
    substitutions,
  });

  if (options.authentik) {
    CoerceFilesStructure(tree, {
      srcFolder: join(__dirname, 'files', 'authentik'),
      target: '',
      overwrite: options.overwrite,
      mergeStrategies: [ YAML_MERGE_STRATEGY, JSON_MERGE_STRATEGY ],
      substitutions,
    });
  }

  switch (options.authentication) {

    case 'oauth2-proxy':
      CoerceFilesStructure(tree, {
        srcFolder: join(__dirname, 'files', 'oauth2-proxy'),
        target: '',
        overwrite: options.overwrite,
        mergeStrategies: [ YAML_MERGE_STRATEGY, JSON_MERGE_STRATEGY ],
        substitutions,
      });
      break;

  }

  if (options.minio) {
    CoerceFilesStructure(tree, {
      srcFolder: join(__dirname, 'files', 'minio'),
      target: '',
      overwrite: options.overwrite,
      mergeStrategies: [ YAML_MERGE_STRATEGY, JSON_MERGE_STRATEGY ],
      substitutions,
    });
  }
}
