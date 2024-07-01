import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  CoerceAppNavigation,
  CoerceAppRoutes,
  CoerceLayoutRoutes,
} from '@rxap/ts-morph';
import { TsMorphAngularProjectTransform } from '@rxap/workspace-ts-morph';
import { CoerceFile } from '@rxap/workspace-utilities';
import { join } from 'path';
import { InitApplicationGeneratorSchema } from './schema';

export function generateMonolithic(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitApplicationGeneratorSchema) {

  if (!project.sourceRoot) {
    throw new Error(`Project source root not found for project ${ projectName }`);
  }

  if (!tree.exists(join(project.sourceRoot, 'assets', 'logo.png'))) {
    if (tree.exists('logo.png')) {
      CoerceFile(tree, join(project.sourceRoot, 'assets', 'logo.png'), tree.read('logo.png')!, true);
    }
  }

  TsMorphAngularProjectTransform(tree, {
    project: projectName,
  }, (_, [ appSourceFile, layoutSourceFile ]) => {
    CoerceLayoutRoutes(layoutSourceFile, {
      component: options.moduleFederation === 'host' ? 'MinimalLayoutComponent' : 'LayoutComponent',
      withNavigation: options.moduleFederation !== 'host',
      withStatusCheckGuard: options.apiStatusCheck,
    });
    CoerceAppRoutes(appSourceFile, {
      itemList: [
        {
          route: {
            path: options.layoutRoutePath ?? '',
            loadChildren: './layout.routes'
          }
        }
      ]
    });
  }, [ 'app/app.routes.ts?', 'app/layout.routes.ts?' ]);

  if (options.moduleFederation !== 'host') {

    TsMorphAngularProjectTransform(tree, {
      project: projectName,
    }, (_, [ navigationSourceFile ]) => {
      CoerceAppNavigation(navigationSourceFile, { overwrite: options.overwrite });
    }, [ 'app/app.navigation.ts?' ]);

  }

}
