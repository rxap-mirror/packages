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
    let content = host.read(layoutRoutesPath, 'utf-8');
    if (!content?.includes('provideLayout(')) {
      console.log(`The project ${ projectName } does not have the provideLayout provider. Skip Migration`);
      continue;
    }
    if (content.includes('provideUserTheme(')) {
      console.log(`The project ${ projectName } already has the provideUserTheme provider. Skip Migration`);
      continue;
    }
    content = content.replace('provideLayout(', 'provideUserTheme(), provideLayout(');
    host.write(layoutRoutesPath, content);
    TsMorphAngularProjectTransform(host, {
      project: projectName,
    }, (_, [ sourceFile ]) => {
      CoerceImports(sourceFile, [
        {
          moduleSpecifier: '@rxap/ngx-user',
          namedImports: [ 'provideUserTheme' ],
        },
      ]);
    }, [ '/app/layout.routes.ts' ]);
  }

}
