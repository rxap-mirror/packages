import {
  generateFiles,
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  CoerceAppNavigation,
  CoerceAppRoutes,
  CoerceLayoutRoutes,
} from '@rxap/ts-morph';
import { classify } from '@rxap/utilities';
import { TsMorphAngularProjectTransform } from '@rxap/workspace-ts-morph';
import { GetProjectPrefix } from '@rxap/workspace-utilities';
import {
  join,
  relative,
} from 'path';
import { InitApplicationGeneratorSchema } from './schema';

export function generateMonolithic(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitApplicationGeneratorSchema) {

  if (!project.sourceRoot) {
    throw new Error(`Project source root not found for project ${ projectName }`);
  }

  if (!tree.exists(join(project.sourceRoot, 'assets', 'logo.png'))) {
    if (tree.exists('logo.png')) {
      tree.write(join(project.sourceRoot, 'assets', 'logo.png'), tree.read('logo.png')!);
    }
  }

  TsMorphAngularProjectTransform(tree, {
    project: projectName,
  }, (_, [ appSourceFile, layoutSourceFile, navigationSourceFile ]) => {
    CoerceLayoutRoutes(layoutSourceFile);
    CoerceAppRoutes(appSourceFile, {
      itemList: [
        {
          route: {
            path: '',
            loadChildren: './layout.routes'
          }
        }
      ]
    });
    CoerceAppNavigation(navigationSourceFile);
  }, [ 'app/app.routes.ts?', 'app/layout.routes.ts?', 'app/app.navigation.ts?' ]);

  if (options.overwrite) {
    generateFiles(tree, join(__dirname, 'files', 'monolithic'), project.sourceRoot, {
      ...options,
      relativePathToWorkspaceRoot: relative(project.sourceRoot, ''),
      name: projectName.replace(/^user-interface-/, ''),
      classify,
      prefix: GetProjectPrefix(tree, projectName, 'rxap'),
    });
  }

}
