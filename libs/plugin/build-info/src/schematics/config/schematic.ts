import {
  chain,
  Rule
} from '@angular-devkit/schematics';
import { updateWorkspace } from '@nrwl/workspace';
import { ConfigSchema } from './schema';

export default function(options: ConfigSchema): Rule {

  return async () => {

    return chain([
      updateWorkspace((workspace) => {
        const project = workspace.projects.get(options.project);

        if (!project) {
          throw new Error('Could not extract target project.');
        }

        if (project.targets.has('build-info')) {

          console.log('Plugin in is already configured.');

        } else {

          project.targets.add({
            name:    'build-info',
            builder: '@rxap/plugin-build-info:build',
            options: {}
          });

        }

      })
    ]);

  };

}
