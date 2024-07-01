import { Tree } from '@nx/devkit';
import {
  CoerceAppRoutes,
  CoerceLayoutRoutes,
} from '@rxap/ts-morph';
import { TsMorphAngularProjectTransform } from '@rxap/workspace-ts-morph';
import { GetProjectSourceRoot } from '@rxap/workspace-utilities';
import { join } from 'path';
import { InitApplicationGeneratorSchema } from './schema';

export function linkMfeRemoteWithHost(tree: Tree, projectName: string, options: InitApplicationGeneratorSchema) {

  if (!options.host) {
    throw new Error('The host project must be defined');
  }

  const hostSourceRoot = GetProjectSourceRoot(tree, options.host);
  const isHostMonolithic = tree.exists(join(hostSourceRoot, 'app/layout.routes.ts'));

  const path = projectName
    .replace(/^user-interface-/, '')
    .replace(/^remote-/, '')
    .replace(/^feature-/, '');

  if (isHostMonolithic && !options.standaloneImport) {
    TsMorphAngularProjectTransform(tree, {
      project: options.host,
    }, (project, [ layoutSourceFile ]) => {
      CoerceLayoutRoutes(layoutSourceFile, {
        itemList: [
          {
            route: {
              path,
              loadRemoteModule: projectName,
            },
            component: 'MinimalLayoutComponent',
          },
        ],
        withStatusCheckGuard: options.apiStatusCheck,
        withNavigation: true,
      });
    }, [ 'app/layout.routes.ts' ]);
  } else {
    TsMorphAngularProjectTransform(tree, {
      project: options.host,
    }, (project, [ appRoutes ]) => {
      CoerceAppRoutes(appRoutes, {
        itemList: [
          {
            route: {
              path,
              loadRemoteModule: projectName,
            },
          },
        ],
      });
    }, [ 'app/app.routes.ts' ]);
  }

}
