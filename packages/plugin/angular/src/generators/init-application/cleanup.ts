import { Tree } from '@nx/devkit';
import {
  CoerceComponentImport,
  CoerceDefaultExport,
  GetComponentDecoratorObject,
  RemoveComponentImport,
  RemoveRoute,
} from '@rxap/ts-morph';
import { TsMorphAngularProjectTransform } from '@rxap/workspace-ts-morph';
import {
  CoerceFile,
  GetProjectRoot,
  GetProjectSourceRoot,
  UpdateTsConfigJson,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import { SyntaxKind } from 'ts-morph';
import { InitApplicationGeneratorSchema } from './schema';

export function cleanup(tree: Tree, projectName: string, options: InitApplicationGeneratorSchema) {

  const sourceRoot = GetProjectSourceRoot(tree, projectName);

  const deleteFiles = [
    'app/app.component.spec.ts',
    'app/nx-welcome.component.ts',
    'app/remote-entry/nx-welcome.component.ts',
    'app/nx-welcome.component.cy.ts',
  ];

  for (const file of deleteFiles) {
    if (tree.exists(join(sourceRoot, file))) {
      tree.delete(join(sourceRoot, file));
    }
  }

  if (tree.exists(join(sourceRoot, 'app/app.component.html'))) {
    const content = tree.read(join(sourceRoot, 'app/app.component.html'), 'utf-8')!
      .replace(/<.+-nx-welcome><\/.+-nx-welcome> /, '')
      .replace(/<ul class="remote-menu">[\s\S]*<\/ul>/, '');
    CoerceFile(tree, join(sourceRoot, 'app/app.component.html'), content, true);
  }

  if (options.moduleFederation !== 'remote') {

    TsMorphAngularProjectTransform(tree, {
      project: projectName,
    }, (_, [ appRoutes, appComponent ]) => {
      RemoveRoute(appRoutes, {
        component: 'NxWelcomeComponent',
        name: 'appRoutes',
      });
      appRoutes.getImportDeclaration('./nx-welcome.component')?.remove();
      appComponent.getClass('AppComponent')?.getProperty('title')?.remove();
      RemoveComponentImport(appComponent, 'NxWelcomeComponent');
    }, [ 'app/app.routes.ts', 'app/app.component.ts' ]);

  }

  if (options.moduleFederation === 'remote') {

    // region module-federation config
    const projectRoot = GetProjectRoot(tree, projectName);
    let content = tree.read(join(projectRoot, 'module-federation.config.ts'))?.toString('utf-8');
    if (content) {
      content = content.replace('./Routes', './routes');
      CoerceFile(tree, join(projectRoot, 'module-federation.config.ts'), content, true);
      // endregion

      // region tsconfig.base.json
      UpdateTsConfigJson(tree, tsConfig => {
        tsConfig.compilerOptions ??= {};
        tsConfig.compilerOptions.paths ??= {};
        if (tsConfig.compilerOptions.paths[`${ projectName }/Routes`]) {
          delete tsConfig.compilerOptions.paths[`${ projectName }/Routes`];
        }
      }, { infix: 'base' });
      // endregion

      TsMorphAngularProjectTransform(tree, {
        project: projectName,
      }, (_, [ entryRoutes ]) => {
        CoerceDefaultExport(entryRoutes.getVariableStatement('remoteRoutes')!.getDeclarations()[0]);
      }, [
        'app/remote-entry/entry.routes.ts',
      ]);
      if (tree.exists(join(sourceRoot, 'app/remote-entry/entry.component.ts'))) {
        TsMorphAngularProjectTransform(tree, {
          project: projectName,
        }, (_, [ entryComponent ]) => {
          entryComponent.getImportDeclaration('./nx-welcome.component')?.remove();
          RemoveComponentImport(entryComponent, 'NxWelcomeComponent');
          RemoveComponentImport(entryComponent, 'CommonModule');
          const componentOptions = GetComponentDecoratorObject(entryComponent);
          const templateProp = componentOptions.getProperty('template');
          if (templateProp &&
              templateProp.asKindOrThrow(SyntaxKind.PropertyAssignment).getInitializer()?.getText().match(
                /<.+nx-welcome><\/.+nx-welcome>/)) {
            templateProp.remove();
            componentOptions.addPropertyAssignment({
              name: 'template',
              initializer: w => w.quote('<router-outlet></router-outlet>'),
            });
            CoerceComponentImport(entryComponent, {
              name: 'RouterModule',
              moduleSpecifier: '@angular/router',
            });
          }
        }, [
          'app/remote-entry/entry.component.ts',
        ]);
      }
      if (options.host) {
        TsMorphAngularProjectTransform(tree, {
          project: options.host,
        }, (_, [ appRoutes ]) => {
          RemoveRoute(appRoutes, {
            loadRemoteModule: {
              name: projectName,
              entry: './Routes',
            },
            name: 'appRoutes',
          });
          appRoutes.organizeImports();
        }, [ 'app/app.routes.ts' ]);
      }
    }
  }

}
