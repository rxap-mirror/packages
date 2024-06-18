import { Tree } from '@nx/devkit';
import {
  CoerceImports,
  CoerceVariableDeclaration,
} from '@rxap/ts-morph';
import { TsMorphNestProjectTransform } from '@rxap/workspace-ts-morph';
import {
  GetWorkspaceName,
  IsStandaloneWorkspace,
} from '@rxap/workspace-utilities';
import {
  WriterFunction,
  Writers,
} from 'ts-morph';

export function coerceEnvironmentFiles(tree: Tree, options: { project: string, sentry: boolean, overwrite: boolean }) {

  TsMorphNestProjectTransform(
    tree,
    {
      project: options.project,
      backend: undefined,
    },
    (project, [ sourceFile, prodSourceFile ]) => {

      CoerceImports(sourceFile, {
        moduleSpecifier: '@rxap/nest-utilities',
        namedImports: [ 'Environment' ],
      });
      CoerceImports(prodSourceFile, {
        moduleSpecifier: '@rxap/nest-utilities',
        namedImports: [ 'Environment' ],
      });

      let appName = options.project;
      if (IsStandaloneWorkspace(tree)) {
        appName = GetWorkspaceName(tree);
      }

      const baseEnvironment: Record<string, WriterFunction | string> = {
        name: w => w.quote('development'),
        production: 'false',
        app: w => w.quote(appName),
      };

      if (options.sentry) {
        baseEnvironment['sentry'] = Writers.object({
          enabled: 'false',
          debug: 'false',
        });
      }

      const normal = CoerceVariableDeclaration(sourceFile, 'environment', {
        type: 'Environment',
        initializer: Writers.object(baseEnvironment),
      });

      if (options.overwrite) {
        normal.set({ initializer: Writers.object(baseEnvironment) });
      }

      baseEnvironment['name'] = w => w.quote('production');
      baseEnvironment['production'] = 'true';

      if (options.sentry) {
        baseEnvironment['sentry'] = Writers.object({
          enabled: 'true',
          debug: 'false',
        });
      }

      const prod = CoerceVariableDeclaration(prodSourceFile, 'environment', {
        type: 'Environment',
        initializer: Writers.object(baseEnvironment),
      });

      if (options.overwrite) {
        prod.set({ initializer: Writers.object(baseEnvironment) });
      }

    },
    [
      '/environments/environment.ts?',
      '/environments/environment.prod.ts?',
    ],
  );

}
