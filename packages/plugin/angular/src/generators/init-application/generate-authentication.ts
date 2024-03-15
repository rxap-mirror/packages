import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { CoerceAppRoutes } from '@rxap/ts-morph';
import { TsMorphAngularProjectTransform } from '@rxap/workspace-ts-morph';
import { AddPackageJsonDependency } from '@rxap/workspace-utilities';
import { InitApplicationGeneratorSchema } from './schema';

export async function generateAuthentication(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitApplicationGeneratorSchema) {

  console.log('generate authentication');

  await AddPackageJsonDependency(tree, '@rxap/ngx-material-authentication', 'latest', { soft: true });

  TsMorphAngularProjectTransform(tree, {
    project: projectName,
  }, (_, [ appSourceFile ]) => {
    CoerceAppRoutes(appSourceFile, {
      itemList: [
        {
          route: {
            path: 'authentication',
            loadChildren: {
              import: '@rxap/ngx-material-authentication',
              then: 'AUTHENTICATION_ROUTE'
            }
          }
        }
      ]
    });
  }, [ 'app/app.routes.ts?' ]);

}
