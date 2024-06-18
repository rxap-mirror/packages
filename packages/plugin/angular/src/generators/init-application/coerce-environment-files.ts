import { Tree } from '@nx/devkit';
import {
  CoerceImports,
  CoerceVariableDeclaration,
} from '@rxap/ts-morph';
import { TsMorphAngularProjectTransform } from '@rxap/workspace-ts-morph';
import {
  WriterFunction,
  Writers,
} from 'ts-morph';
import { InitApplicationGeneratorSchema } from './schema';

export function coerceEnvironmentFiles(tree: Tree, options: InitApplicationGeneratorSchema & { project: string }) {

  TsMorphAngularProjectTransform(
    tree,
    {
      project: options.project,
    },
    (project, [ sourceFile, prodSourceFile ]) => {

      CoerceImports(sourceFile, {
        moduleSpecifier: '@rxap/environment',
        namedImports: [ 'Environment' ],
      });
      CoerceImports(prodSourceFile, {
        moduleSpecifier: '@rxap/environment',
        namedImports: [ 'Environment' ],
      });

      const baseEnvironment: Record<string, WriterFunction | string> = {
        name: w => w.quote('development'),
        production: 'false',
        app: w => w.quote(options.project),
      };

      // region dev environment

      if (options.serviceWorker) {
        baseEnvironment['serviceWorker'] = 'false';
      }

      if (options.sentry) {
        baseEnvironment['sentry'] = Writers.object({
          enabled: 'false',
          debug: 'false',
        });
      }

      if (options.moduleFederation === 'host') {
        baseEnvironment['moduleFederation'] = Writers.object({
          manifest: w => w.quote('/module-federation.manifest.json'),
        });
      }

      const normal = CoerceVariableDeclaration(sourceFile, 'environment', {
        type: 'Environment',
        initializer: Writers.object(baseEnvironment),
      });

      if (options.overwrite) {
        normal.set({ initializer: Writers.object(baseEnvironment) });
      }

      // region

      // region prod environment

      if (options.moduleFederation === 'host') {
        delete baseEnvironment['moduleFederation'];
      }

      if (options.serviceWorker) {
        baseEnvironment['serviceWorker'] = 'true';
      }

      if (options.sentry) {
        baseEnvironment['sentry'] = Writers.object({
          enabled: 'true',
          debug: 'false',
        });
      }

      baseEnvironment['name'] = w => w.quote('production');
      baseEnvironment['production'] = 'true';

      const prod = CoerceVariableDeclaration(prodSourceFile, 'environment', {
        type: 'Environment',
        initializer: Writers.object(baseEnvironment),
      });

      if (options.overwrite) {
        prod.set({ initializer: Writers.object(baseEnvironment) });
      }

      // endregion

    },
    [
      '/environments/environment.ts?',
      '/environments/environment.prod.ts?',
    ],
  );

}
