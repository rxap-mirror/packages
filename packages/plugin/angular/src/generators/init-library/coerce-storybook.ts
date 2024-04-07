import { storybookConfigurationGenerator } from '@nx/angular/generators';
import type { StorybookConfigurationOptions } from '@nx/angular/src/generators/storybook-configuration/schema';
import { Tree } from '@nx/devkit';
import { Linter } from '@nx/linter';
import {
  CoerceFilesStructure,
  GetProjectRoot,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import { InitLibraryGeneratorSchema } from './schema';

export async function coerceStorybook(tree: Tree, projectName: string, options: InitLibraryGeneratorSchema) {
  if (!options.storybook) {
    return;
  }
  let storybookOptions: StorybookConfigurationOptions;
  if (typeof options.storybook === 'boolean') {
    storybookOptions = {
      configureTestRunner: true,
      configureCypress: false,
      generateCypressSpecs: false,
      generateStories: true,
      configureStaticServe: true,
      tsConfiguration: true,
      linter: Linter.EsLint,
      name: projectName
    };
  } else {
    storybookOptions = {
      name: projectName,
      ...options.storybook,
    };
  }
  await storybookConfigurationGenerator(tree, storybookOptions);
  const projectRoot = GetProjectRoot(tree, projectName);
  CoerceFilesStructure(tree, {
    srcFolder: join(__dirname, 'files', 'storybook'),
    target: join(projectRoot, '.storybook'),
    overwrite: options.overwrite,
  });
}
