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
}
