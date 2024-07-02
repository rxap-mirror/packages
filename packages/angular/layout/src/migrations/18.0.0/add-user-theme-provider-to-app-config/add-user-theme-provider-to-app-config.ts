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

export default function update(host: Tree) {

  for (const [ projectName, project ] of getProjects(host)) {
    if (!IsApplicationProject(project) || !IsAngularProject(project)) {
      continue;
    }
    const projectSourceRoot = GetProjectSourceRoot(host, projectName);
    const layoutRoutesPath = `${ projectSourceRoot }/app/layout.routes.ts`;
    if (!host.exists(layoutRoutesPath)) {
      console.log(`The project ${ projectName } does not have a layout.routes.ts file. Skip Migration`);
      continue;
    }
    if (!host.exists(`${ projectSourceRoot }/app/app.config.ts`)) {
      console.log(`The project ${ projectName } does not have a app.config.ts file. Skip Migration`);
      continue;
    }
    TsMorphAngularProjectTransform(host, {
      project: projectName,
    }, (_, [ sourceFile ]) => {
      CoerceAppConfigProvider(sourceFile, {
        providers: [ 'provideUserTheme()' ],
      });
      CoerceImports(sourceFile, {
        moduleSpecifier: '@rxap/ngx-user',
        namedImports: [ 'provideUserTheme' ],
      });
    }, [ '/app/app.config.ts' ]);
  }

}
