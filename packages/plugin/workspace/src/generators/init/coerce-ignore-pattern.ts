import { Tree } from '@nx/devkit';
import {
  CoerceIgnorePattern,
  RemoveIgnorePattern,
} from '@rxap/workspace-utilities';
import {
  gitIgnore,
  prettierIgnore,
} from './const';

export function coerceIgnorePattern(tree: Tree) {
  CoerceIgnorePattern(tree, '.gitignore', gitIgnore);
  RemoveIgnorePattern(tree, '.gitignore', [ '/.idea' ]);
  CoerceIgnorePattern(tree, '.prettierignore', prettierIgnore);
  CoerceIgnorePattern(tree, '.idea/.gitignore', [
    '/copilot/chatSessions',
    'jsLibraryMappings.xml',
    'nx-angular-config.xml',
    'nx-console.xml',
    'cody_history.xml',
    '/JetClient',
    '/developer-tools.xml',
  ]);
}
