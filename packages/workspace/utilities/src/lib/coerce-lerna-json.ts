import { CoerceArrayItems } from '@rxap/utilities';
import { join } from 'path';
import { CoerceFile } from './coerce-file';
import { TreeLike } from './tree';

export function CoerceLernaJson(tree: TreeLike, baseDir = '') {
  const lernaJson = JSON.parse(CoerceFile(tree, join(baseDir, 'lerna.json'), '{}'));
  lernaJson.$schema ??= 'https://json.schemastore.org/lerna';
  lernaJson.useWorkspaces ??= true;
  lernaJson.version ??= 'independent';
  lernaJson.npmClient ??= 'yarn';
  lernaJson.command ??= {};
  lernaJson.command.version ??= {};
  lernaJson.command.version.message ??= 'chore(release): version';
  lernaJson.command.version.conventionalCommits ??= true;
  lernaJson.command.version.allowBranch ??= [];
  CoerceArrayItems(lernaJson.command.version.allowBranch, [
    'development',
    'latest',
    'next',
    '+(1|2|3|4|5|6|7|8|9|0).x.x',
    '+(1|2|3|4|5|6|7|8|9|0).+(1|2|3|4|5|6|7|8|9|0).x',
    '+(1|2|3|4|5|6|7|8|9|0).x.x-dev',
    '+(1|2|3|4|5|6|7|8|9|0).+(1|2|3|4|5|6|7|8|9|0).x-dev',
  ]);
  lernaJson.command.version.ignoreChanges ??= [];
  CoerceArrayItems(lernaJson.command.version.ignoreChanges, [
    [
      '**/*.md',
      '**/*.spec.ts',
      '**/*.stories.ts',
      '**/*.cy.ts',
      '**/*.js',
      '**/*.handlebars',
      '**/tsconfig.json',
      '**/tsconfig.*.json',
      '**/*.yaml',
    ],
  ]);
}
