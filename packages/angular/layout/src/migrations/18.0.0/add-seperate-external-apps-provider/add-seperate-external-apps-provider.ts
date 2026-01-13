/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  getProjects,
  Tree,
} from '@nx/devkit';
import {
  CoerceAppConfigProvider,
  CoerceImports,
} from '@rxap/ts-morph';
import { TsMorphAngularProjectTransform } from '@rxap/workspace-ts-morph';
import {
  GetProjectSourceRoot,
  IsAngularProject,
  IsApplicationProject,
} from '@rxap/workspace-utilities';
import { join } from 'path';

export default async function update(tree: Tree) {
  // ...

  console.log('Add separate external apps provider to app config');

  for (const [projectName, project] of getProjects(tree).entries()) {

    // skip all projects that are not angular application projects
    if (!(IsAngularProject(project) && IsApplicationProject(project))) {
      console.log(`The project ${projectName} is not an angular application project. Skip the migration!`);
      continue;
    }

    const projectSourceRoot = GetProjectSourceRoot(tree, projectName);

    const layoutRoutesFilePath = join(projectSourceRoot, 'app', 'layout.routes.ts');

    if (!tree.exists(join(layoutRoutesFilePath))) {
      console.log(`The project ${projectName} does not have a layout.routes.ts file. Skip the migration!`);
      continue;
    }

    const appConfigFilePath = join(projectSourceRoot, 'app', 'app.config.ts');

    if (!tree.exists(join(appConfigFilePath))) {
      console.log(`The project ${projectName} does not have a app.config.ts file. Skip the migration!`);
      continue;
    }

    await TsMorphAngularProjectTransform(tree, { project: projectName }, (_, [appConfig]) => {
      CoerceAppConfigProvider(appConfig, {
        providers: ['provideExternalApps()']
      });
      CoerceImports(appConfig, {
        moduleSpecifier: '@rxap/layout',
        namedImports: ['provideExternalApps']
      });
    }, [ join('app', 'app.config.ts') ]);

  }

}
