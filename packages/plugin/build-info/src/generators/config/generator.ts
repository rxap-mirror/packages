import {
  readNxJson,
  Tree,
  updateNxJson,
  updateProjectConfiguration,
} from '@nx/devkit';
import { ConfigGeneratorSchema } from './schema';
import { readProjectConfiguration } from 'nx/src/generators/utils/project-configuration';
import { CreateConfigurationMapMatchingWithTarget } from '@rxap/plugin-utilities';

export async function configGenerator(
  tree: Tree,
  options: ConfigGeneratorSchema,
) {
  const projectConfiguration = readProjectConfiguration(tree, options.project);

  projectConfiguration.targets ??= {};
  if (projectConfiguration.targets['build-info']) {
    console.log('remove old build-info target');
    delete projectConfiguration.targets['build-info'];
  }
  projectConfiguration.targets['serialize-environment'] ??= {
    executor: '@rxap/plugin-build-info:generate',
    configurations: CreateConfigurationMapMatchingWithTarget(projectConfiguration, 'build'),
  };

  updateProjectConfiguration(tree, options.project, projectConfiguration);

  const nxJson = readNxJson(tree);

  nxJson.targetDefaults ??= {};
  nxJson.targetDefaults['serialize-environment'] ??= {
    dependsOn: [ '^build' ],
  };

  updateNxJson(tree, nxJson);

}

export default configGenerator;
