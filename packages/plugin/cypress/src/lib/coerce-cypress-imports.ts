import { Tree } from '@nx/devkit';
import { CoerceImports } from '@rxap/ts-morph';
import { TsMorphProjectTransform } from '@rxap/workspace-ts-morph';

export function coerceCypressImports(tree: Tree, projectName: string) {
  TsMorphProjectTransform(tree, { project: projectName }, (_, [commandsSourceFile]) => {

    CoerceImports(commandsSourceFile, [
      {
        moduleSpecifier: 'workspace/cypress/commands',
      },
      {
        moduleSpecifier: 'workspace/cypress/support',
      }
    ]);

  }, ['cypress/support/commands.ts']);
}
