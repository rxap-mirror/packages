import { storybookConfigurationGenerator } from '@nx/angular/generators';
import type { StorybookConfigurationOptions } from '@nx/angular/src/generators/storybook-configuration/schema';
import { Tree } from '@nx/devkit';
import { Linter } from '@nx/linter';
import {
  CoerceFilesStructure,
  GetProjectRoot,
} from '@rxap/workspace-utilities';
import { join } from 'path';

export async function coerceStorybook(tree: Tree, projectName: string, options: Omit<StorybookConfigurationOptions, 'name'> & { overwrite?: boolean }) {
  const storybookOptions: StorybookConfigurationOptions = {
    ...options,
    name: projectName,
  };

  storybookOptions.configureTestRunner ??= true;
  storybookOptions.configureCypress ??= false;
  storybookOptions.generateCypressSpecs ??= false;
  storybookOptions.generateStories ??= true;
  storybookOptions.configureStaticServe ??= true;
  storybookOptions.tsConfiguration ??= true;
  storybookOptions.linter ??= Linter.EsLint;

  await storybookConfigurationGenerator(tree, storybookOptions);
  const projectRoot = GetProjectRoot(tree, projectName);
  CoerceFilesStructure(tree, {
    srcFolder: join(__dirname, 'files', 'storybook'),
    target: join(projectRoot, '.storybook'),
    overwrite: options.overwrite,
  });
}
