import {
  readNxJson,
  readProjectConfiguration,
  Tree,
  updateNxJson,
  updateProjectConfiguration,
} from '@nx/devkit';
import {
  CoerceFilesStructure,
  CoerceIgnorePattern,
  CoerceTarget,
  CoerceTargetDefaultsDependency,
  GetProjectSourceRoot,
  UpdateNxJson,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import { ConfigGeneratorSchema } from './schema';

export async function configGenerator(tree: Tree, options: ConfigGeneratorSchema) {
  const projectSourceRoot = GetProjectSourceRoot(tree, options.project);

  if (!projectSourceRoot) {
    throw new Error(`Could not find project source root for project: ${ options.project }`);
  }

  CoerceFilesStructure(tree, {
    srcFolder: join(__dirname, 'files'),
    target: projectSourceRoot,
    overwrite: options.overwrite,
  });

  const projectConfiguration = readProjectConfiguration(tree, options.project);

  if (projectConfiguration.targets['extract-i18n']) {
    projectConfiguration.targets['extract-i18n'].options ??= {};
    projectConfiguration.targets['extract-i18n'].options.format = 'xliff2';
    projectConfiguration.targets['extract-i18n'].options.outputPath = join(projectSourceRoot, 'i18n');
  }

  if (options.readKey) {
    CoerceTarget(projectConfiguration, 'localazy-download', {
      options: {
        readKey: options.readKey,
      }
    });
  }

  updateProjectConfiguration(tree, options.project, projectConfiguration);

  UpdateNxJson(tree, nxJson => {
    CoerceTargetDefaultsDependency(nxJson, '@angular-devkit/build-angular:browser', 'localazy-download');
  });

  CoerceIgnorePattern(tree, join(projectSourceRoot, '.gitignore'), [ '/i18n' ]);

}

export default configGenerator;
