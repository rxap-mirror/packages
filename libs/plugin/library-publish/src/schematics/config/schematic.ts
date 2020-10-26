import {
  chain,
  Rule
} from '@angular-devkit/schematics';
import { updateWorkspace } from '@nrwl/workspace';
import { ConfigSchema } from './schema';

export default function(options: ConfigSchema): Rule {

  return () => {

    return chain([
      updateWorkspace((workspace) => {
        const project = workspace.projects.get(options.project);

        if (!project) {
          throw new Error('Could not extract target project.');
        }

        if (project.targets.has('publish')) {

        } else {

          const targetOptions: any = {};

          targetOptions.buildTarget = options.buildTarget ?? `${options.project}:build:production`;

          if (!options.buildTarget) {
            if (project.targets.has('build')) {
              const buildTarget = project.targets.get('build')!;
              if (buildTarget.configurations?.hasOwnProperty('production')) {
                targetOptions.buildTarget = `${options.project}:build:production`;
              } else {
                targetOptions.buildTarget = `${options.project}:build`;
              }
            } else {
              throw new Error('The build target is not defined.');
            }
          } else {
            targetOptions.buildTarget = options.buildTarget;
          }

          if (options.preTarget) {
            targetOptions.preTarget = options.preTarget;
          } else {
            if (project.targets.has('pack')) {
              targetOptions.preTarget = `${options.project}:pack`;
            } else if (project.targets.has('build')) {
              const buildTarget = project.targets.get('build')!;
              if (buildTarget.configurations?.hasOwnProperty('production')) {
                targetOptions.preTarget = `${options.project}:build:production`;
              } else {
                targetOptions.preTarget = `${options.project}:build`;
              }
            } else {
              targetOptions.preTarget = options.buildTarget;
            }
          }

          project.targets.add({
            name:    'publish',
            builder: '@rxap-plugin/library-publish:publish',
            options: targetOptions
          });

        }

      })
    ]);

  };

}
