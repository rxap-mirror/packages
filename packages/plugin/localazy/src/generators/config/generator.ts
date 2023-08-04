import {
  generateFiles,
  readNxJson,
  readProjectConfiguration,
  Tree,
  updateNxJson,
  updateProjectConfiguration,
} from '@nx/devkit';
import {
  CoerceIgnorePattern,
  GetProjectSourceRoot,
} from '@rxap/generator-utilities';
import * as path from 'path';
import { join } from 'path';
import { UploadExecutorSchema } from '../../executors/upload/schema';
import { ConfigGeneratorSchema } from './schema';

export async function configGenerator(tree: Tree, options: ConfigGeneratorSchema) {
  const projectSourceRoot = GetProjectSourceRoot(tree, options.project);

  if (!projectSourceRoot) {
    throw new Error(`Could not find project source root for project: ${ options.project }`);
  }

  generateFiles(tree, path.join(__dirname, 'files'), projectSourceRoot, options);

  const projectConfiguration = readProjectConfiguration(tree, options.project);

  projectConfiguration.targets ??= {};
  projectConfiguration.targets['localazy-download'] ??= {
    executor: '@rxap/plugin-localazy:download',
  };
  if (!projectConfiguration.targets['localazy-upload']) {

    const buildOptions: UploadExecutorSchema = {};

    if (options.extractTarget) {
      buildOptions.extractTarget = options.extractTarget;
    }

    projectConfiguration.targets['localazy-upload'] = {
      executor: '@rxap/plugin-localazy:upload',
      options: buildOptions,
    };

  }

  if (projectConfiguration.targets['extract-i18n']) {
    projectConfiguration.targets['extract-i18n'].options ??= {};
    projectConfiguration.targets['extract-i18n'].options.format = 'xliff2';
    projectConfiguration.targets['extract-i18n'].options.options.outputPath = join(projectSourceRoot, 'i18n');
  }

  updateProjectConfiguration(tree, options.project, projectConfiguration);

  const nxJson = readNxJson(tree);

  nxJson.targetDefaults ??= {};
  nxJson.targetDefaults['localazy-upload'] ??= {
    dependsOn: [ 'extract-i18n' ],
  };

  updateNxJson(tree, nxJson);

  CoerceIgnorePattern(tree, join(projectSourceRoot, '.gitignore'), [ '/i18n' ]);

}

export default configGenerator;
