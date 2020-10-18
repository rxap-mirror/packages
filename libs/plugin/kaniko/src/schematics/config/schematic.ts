import {
  chain,
  Rule,
  Tree,
  mergeWith,
  url,
  apply,
  move,
  applyTemplates,
  noop,
  forEach
} from '@angular-devkit/schematics';
import { updateWorkspace } from '@nrwl/workspace';
import { ConfigSchema } from './schema';
import { join } from 'path';
import { createDefaultPath } from '@schematics/angular/utility/workspace';

export default function(options: ConfigSchema): Rule {

  return async (host: Tree) => {

    const projectRootLibPath = await createDefaultPath(host, options.project as string);

    const projectRootPath    = join(projectRootLibPath, '../');
    const dockerPath = join(projectRootPath, 'Dockerfile');

    return chain([
      updateWorkspace((workspace) => {
        const project = workspace.projects.get(options.project);

        if (!project) {
          throw new Error('Could not extract target project.');
        }

        if (project.targets.has('kaniko')) {

        } else {

          const targetOptions: any = {
            dockerfile: options.dockerfile ?? dockerPath.replace(/^\//, ''),
            destination: options.destination,
          }

          if (options.context) {
            targetOptions.context = options.context
          }

          if (options.command) {
            targetOptions.command = options.command;
          }

          if (options.buildTarget) {
            targetOptions.buildTarget = options.buildTarget;
          } else if (project.targets.has('build')) {
            const buildTarget = project.targets.get('build')!;

            if (buildTarget.configurations && buildTarget.configurations['production']) {
              targetOptions.buildTarget = `${options.project}:build:production`;
            } else {
              targetOptions.buildTarget = `${options.project}:build`;
            }

          }

          if (options.preTarget) {
            targetOptions.preTarget = options.preTarget
          } else {
            targetOptions.preTarget = targetOptions.buildTarget;
          }

          project.targets.add({
            name:    'kaniko',
            builder: `@rxap-plugin/kaniko:executor`,
            options: targetOptions
          });

        }

      }),
      host.exists(dockerPath) || options.dockerfile ?
      noop() :
      mergeWith(apply(url('./files'), [
        applyTemplates({}),
        move(projectRootPath),
        forEach(fileEntry => {
          if (host.exists(fileEntry.path)) {
            return null;
          }
          return fileEntry;
        })
      ]))
    ]);

  };

}
