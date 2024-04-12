import { cypressComponentConfiguration } from '@nx/angular/generators';
import { Tree } from '@nx/devkit';
import { GetDefaultGeneratorOptions } from '@rxap/workspace-utilities';
import { guessBuildTarget } from './guess-build-target';

export async function setupComponentTestTarget(tree: Tree, projectName: string, options: { generateTests?: boolean; skipFormat?: boolean; buildTarget?: string; }) {

  const defaultOptions = GetDefaultGeneratorOptions(tree, '@nx/angular:cypress-component-configuration');
  await cypressComponentConfiguration(tree, {
    ...defaultOptions,
    project: projectName,
    generateTests: options.generateTests ?? true,
    skipFormat: options.skipFormat ?? false,
    buildTarget: options.buildTarget ?? guessBuildTarget(tree),
  });

}
