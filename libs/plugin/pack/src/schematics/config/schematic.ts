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

        if (project.targets.has('pack')) {

        } else {

          const targets: string[] = [];

          if (project.targets.has('build')) {
            const buildTarget = project.targets.get('build')!;

            if (buildTarget.configurations && buildTarget.configurations['production']) {
              targets.push(`${options.project}:build:production`);
            } else {
              targets.push(`${options.project}:build`);
            }

          }

          project.targets.add({
            name:    'pack',
            builder: '@rxap/plugin-pack:build',
            options: { targets }
          });

        }

      })
    ]);

  };

}
