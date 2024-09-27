import { ProjectConfiguration } from '@nx/devkit';
import {
  CoerceAssets,
  CoerceTarget,
  GetTarget,
  Strategy,
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

  const fixDependencies = GetTarget(project, 'fix-dependencies');
  if (fixDependencies) {
    CoerceTarget(project, 'fix-dependencies', {
      "options": {
        "options": {
          "onlyDependencies": true,
          "peerDependencies": [
            "n8n-workflow"
          ]
        }
      }
    }, Strategy.MERGE);
  }

}
