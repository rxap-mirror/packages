import { Tree } from '@nx/devkit';
import {
  CoerceIgnorePattern,
  PackageManagerProfile,
  RemoveIgnorePattern,
} from '@rxap/workspace-utilities';
import {
  gitIgnore,
  gitIgnoreForPackageManager,
  prettierIgnore,
} from './const';

export function coerceIgnorePattern(tree: Tree, packageManager: PackageManagerProfile) {
  CoerceIgnorePattern(tree, '.gitignore', [ ...gitIgnore, ...gitIgnoreForPackageManager(packageManager) ]);
  RemoveIgnorePattern(tree, '.gitignore', [ '/.idea' ]);
  CoerceIgnorePattern(tree, '.prettierignore', prettierIgnore);
}
