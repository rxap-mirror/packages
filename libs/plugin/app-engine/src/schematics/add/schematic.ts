import {
  apply,
  chain,
  mergeWith,
  move,
  Rule,
  url,
  Tree,
  template
} from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';
import {
  updateWorkspace,
  getWorkspace
} from '@nrwl/workspace';
import { AddSchema } from './schema';

export async function getProjectPath(host: Tree, projectName: string) {
  const workspace = await getWorkspace(host);

  const project = workspace.projects.get(projectName);

  if (!project) {
    throw new Error('Could not extract target project.');
  }

  return project.sourceRoot ? `/${project.sourceRoot}/` : `/${project.root}/src/`;
}

export default function(options: AddSchema): Rule {

  return async (host: Tree) => {

    const path = await getProjectPath(host, options.project);

    return chain([
      updateWorkspace((workspace) => {
        const project = workspace.projects.get(options.project);

        if (!project) {
          throw new Error('Could not extract target project.');
        }

        if (project.targets.has('app-engine-deploy')) {

        } else {

          project.targets.add({
            name:    'app-engine-deploy',
            builder: '@rxap/plugin-app-engine:deploy'
          });

        }

      }),
      mergeWith(
        apply(url('./files'), [
          template({
            ...strings,
            ...options
          }),
          move(path)
        ])
      )
    ]);

  };

}
