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

          if (options.preTarget) {
            targetOptions.preTarget = options.preTarget;
          } else if (project.targets.has('pack')) {
            targetOptions.preTarget = `${options.project}:pack`;
          } else {
            targetOptions.preTarget = targetOptions.buildTarget;
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
