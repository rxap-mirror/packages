import {
  chain,
  Rule,
  Tree,
  mergeWith,
  url,
  apply,
  move,
  template,
  noop,
} from '@angular-devkit/schematics';
import { updateWorkspace } from '@nrwl/workspace';
import { ConfigSchema } from './schema';
import { join } from 'path';
import { createDefaultPath } from '@schematics/angular/utility/workspace';

export default function (options: ConfigSchema): Rule {
  return async (host: Tree) => {
    const projectRootLibPath = await createDefaultPath(
      host,
      options.project as string
    );

    const projectRootPath = join(projectRootLibPath, '../../');
    const readmeTemplatePath = join(projectRootPath, 'README.md.handlebars');

    return chain([
      updateWorkspace((workspace) => {
        const project = workspace.projects.get(options.project);

        if (!project) {
          throw new Error('Could not extract target project.');
        }

        if (project.targets.has('readme')) {
        } else {
          project.targets.add({
            name: 'readme',
            builder: `@rxap/plugin-readme-generator:${options.type}`,
            options: {},
          });
        }

        if (project.targets.has('pack')) {
          const packTarget = project.targets.get('pack')!;

          if (!packTarget.options) {
            packTarget.options = {};
          }

          if (
            !packTarget.options.targets ||
            !Array.isArray(packTarget.options.targets)
          ) {
            packTarget.options.targets = [];
          }

          packTarget.options.targets.unshift(`${options.project}:readme`);
        }
      }),
      host.exists(readmeTemplatePath)
        ? noop()
        : mergeWith(
            apply(url('./files/' + options.type), [
              template({}),
              move(projectRootPath),
            ])
          ),
    ]);
  };
}
