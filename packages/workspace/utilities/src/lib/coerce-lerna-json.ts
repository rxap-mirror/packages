import { CoerceArrayItems } from '@rxap/utilities';
import { join } from 'path';
import { UpdateJsonFile } from './json-file';
import { TreeLike } from './tree';

export function CoerceLernaJson(tree: TreeLike, baseDir = '') {
  UpdateJsonFile(tree, (lerna: any) => {
    lerna.$schema ??= 'https://json.schemastore.org/lerna';
    lerna.useWorkspaces ??= true;
    lerna.version ??= 'independent';
    lerna.npmClient ??= 'yarn';
    lerna.command ??= {};
    lerna.command.version ??= {};
    lerna.command.version.message ??= 'chore(release): version';
    lerna.command.version.conventionalCommits ??= true;
    lerna.command.version.allowBranch ??= [];
    CoerceArrayItems(lerna.command.version.allowBranch, [
      'development',
      'latest',
      'next',
      '+(1|2|3|4|5|6|7|8|9|0).x.x',
      '+(1|2|3|4|5|6|7|8|9|0).+(1|2|3|4|5|6|7|8|9|0).x',
      '+(1|2|3|4|5|6|7|8|9|0).x.x-dev',
      '+(1|2|3|4|5|6|7|8|9|0).+(1|2|3|4|5|6|7|8|9|0).x-dev',
    ]);
    lerna.command.version.ignoreChanges ??= [];
    CoerceArrayItems(lerna.command.version.ignoreChanges, [
      '**/*.md',
      '**/*.spec.ts',
      '**/*.stories.ts',
      '**/*.cy.ts',
      '**/*.js',
      '**/*.handlebars',
      '**/tsconfig.json',
      '**/tsconfig.*.json',
      '**/*.yaml',
    ]);
  }, join(baseDir, 'lerna.json'), { create: true });

}
