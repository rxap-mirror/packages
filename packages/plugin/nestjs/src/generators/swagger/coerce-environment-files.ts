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

export function coerceEnvironmentFiles(tree: Tree, options: { project: string, overwrite?: boolean }) {

  TsMorphNestProjectTransform(
    tree,
    {
      project: options.project,
      backend: undefined,
    },
    (project, [ sourceFile ]) => {

      CoerceImports(sourceFile, {
        moduleSpecifier: '@rxap/nest-utilities',
        namedImports: [ 'Environment' ],
      });

      let appName = options.project;
      if (IsStandaloneWorkspace(tree)) {
        appName = GetWorkspaceName(tree);
      }

      const baseEnvironment: Record<string, WriterFunction | string> = {
        name: w => w.quote('swagger'),
        production: 'true',
        swagger: 'true',
        app: w => w.quote(appName),
      };

      const normal = CoerceVariableDeclaration(sourceFile, 'environment', {
        type: 'Environment',
        initializer: Writers.object(baseEnvironment),
      });

      if (options.overwrite) {
        normal.set({ initializer: Writers.object(baseEnvironment) });
      }

    },
    [
      '/environments/environment.swagger.ts?',
    ],
  );

}
