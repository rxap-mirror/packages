import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { CoerceAppRoutes } from '@rxap/ts-morph';
import { TsMorphAngularProjectTransform } from '@rxap/workspace-ts-morph';
import { InitApplicationGeneratorSchema } from './schema';

export function generateAuthentication(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitApplicationGeneratorSchema) {

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
