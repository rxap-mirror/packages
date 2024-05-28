import { storybookConfigurationGenerator } from '@nx/angular/generators';
import type { StorybookConfigurationOptions } from '@nx/angular/src/generators/storybook-configuration/schema';
import {
  ProjectConfiguration,
  readProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { Linter } from '@nx/eslint';
import 'colors';
import { CoerceTarget } from '@rxap/workspace-utilities';

export async function coerceStorybook(
  tree: Tree,
  projectName: string,
  project: ProjectConfiguration,
  options: Omit<StorybookConfigurationOptions, 'project'> & { overwrite?: boolean }
) {
  if (project.targets?.storybook) {
    console.log(
      `storybook target already exists for project: ${projectName}`.yellow
    );
    return;
  }

  const storybookOptions: StorybookConfigurationOptions = {
    ...options,
    project: projectName,
  };

  storybookOptions.configureCypress ??= false;
  storybookOptions.generateCypressSpecs ??= false;
  storybookOptions.generateStories ??= true;
  storybookOptions.configureStaticServe ??= true;
  storybookOptions.tsConfiguration ??= true;
  storybookOptions.linter ??= Linter.EsLint;

  await storybookConfigurationGenerator(tree, storybookOptions);

  // the external generator does not update the project configuration
  // to reflect the changes made in the current project object we need to merge the changes
  const { targets } = readProjectConfiguration(tree, projectName);
  for (const [name, target] of Object.entries(targets)) {
    CoerceTarget(project, name, target);
  }
}
