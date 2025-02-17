import { ProjectConfiguration } from '@nx/devkit';
import {
  CoerceAssets,
  GetTarget,
} from '@rxap/workspace-utilities';
import { InitGeneratorSchema } from './schema';

export function updateProjectTargets(project: ProjectConfiguration, options: InitGeneratorSchema) {

  const build = GetTarget(project, 'build');
  const buildOptions = build?.options ?? {};

  if (!buildOptions) {
    throw new Error(`build options not found for project: ${ project.name }`);
  }

  buildOptions.assets ??= [];
  CoerceAssets(buildOptions.assets, [
    {
      'input': `./${project.root}/src/lib`,
      'glob': '**/*.(svg|json|png)',
      'output': './src/lib',
    },
  ]);

}
