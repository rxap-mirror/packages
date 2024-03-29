import {
  readNxJson,
  readProjectConfiguration,
  Tree,
  updateNxJson,
  updateProjectConfiguration,
} from '@nx/devkit';
import { GetProjectSourceRoot } from '@rxap/generator-utilities';
import { CreateConfigurationMapMatchingWithTarget } from '@rxap/plugin-utilities';
import { CoerceFilesStructure } from '@rxap/workspace-utilities';
import { join } from 'path';
import { ConfigGeneratorSchema } from './schema';

export async function configGenerator(
  tree: Tree,
  options: ConfigGeneratorSchema,
) {
  const projectSourceRoot = GetProjectSourceRoot(tree, options.project);
  if (!projectSourceRoot) {
    throw new Error(`Can't find project source root for project: ${ options.project }`);
  }
  CoerceFilesStructure(tree, {
    srcFolder: join(__dirname, 'files'),
    target: projectSourceRoot,
    overwrite: options.overwrite,
  });

  const projectConfiguration = readProjectConfiguration(tree, options.project);

  projectConfiguration.targets ??= {};

  if (!projectConfiguration.targets['docker']) {

    const targetOptions: any = {};

    if (options.dockerfile) {
      targetOptions.dockerfile = options.dockerfile;
    }

    if (options.imageSuffix) {
      targetOptions.imageSuffix = options.imageSuffix;
    }

    if (options.imageName) {
      targetOptions.imageName = options.imageName;
    }

    if (options.imageRegistry) {
      targetOptions.imageRegistry = options.imageRegistry;
    }

    if (options.context) {
      targetOptions.context = options.context;
    }

    if (options.command) {
      targetOptions.command = options.command;
    }

    projectConfiguration.targets['docker'] = {
      executor: '@rxap/plugin-docker:build',
      options: targetOptions,
      configurations: CreateConfigurationMapMatchingWithTarget(projectConfiguration, 'build'),
    };

    updateProjectConfiguration(tree, options.project, projectConfiguration);
  }

  if (projectConfiguration.targets['save']) {
    if (projectConfiguration.targets['save'].executor === '@rxap/plugin-docker:save') {
      projectConfiguration.targets['docker-save'] = projectConfiguration.targets['save'];
      delete projectConfiguration.targets['save'];
    }
  }

  if (options.save) {
    if (!projectConfiguration.targets['docker-save']) {
      projectConfiguration.targets['docker-save'] = {
        executor: '@rxap/plugin-docker:save',
        configurations: CreateConfigurationMapMatchingWithTarget(projectConfiguration, 'build'),
      };
    }
  }

  const nxJson = readNxJson(tree);

  nxJson.targetDefaults ??= {};
  nxJson.targetDefaults['docker'] ??= {
    dependsOn: [ '^build' ],
  };

  if (options.save) {
    nxJson.targetDefaults['save'] ??= {
      dependsOn: [ 'docker' ],
    };
  }

  updateNxJson(tree, nxJson);

}

export default configGenerator;
