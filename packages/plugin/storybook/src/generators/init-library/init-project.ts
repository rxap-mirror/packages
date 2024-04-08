import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  CoerceFilesStructure,
  GetProjectRoot,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import { coerceMain } from '../../lib/coerce-main';
import { coercePreview } from '../../lib/coerce-preview';
import { coerceProjectTarget } from '../../lib/coerce-project-target';
import { coerceStorybook } from '../../lib/coerce-storybook';
import { coerceTsConfig } from '../../lib/coerce-ts-config';
import { InitLibraryGeneratorSchema } from './schema';

export async function initProject(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitLibraryGeneratorSchema) {
  console.log(`init storybook library project: ${ projectName }`);

  await coerceStorybook(tree, projectName, project, options);

  const projectRoot = GetProjectRoot(tree, projectName);
  CoerceFilesStructure(tree, {
    srcFolder: join(__dirname, 'files', 'storybook'),
    target: join(projectRoot, '.storybook'),
    overwrite: options.overwrite,
  });

  await coerceMain(tree, projectName, options);
  await coercePreview(tree, projectName, options);
  await coerceProjectTarget(tree, projectName, project, options);
  await coerceProjectTarget(tree, projectName, project, options);
  coerceTsConfig(tree, projectName, options);

}
