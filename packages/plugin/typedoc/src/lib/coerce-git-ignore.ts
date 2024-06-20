import { Tree } from '@nx/devkit';
import {
  CoerceIgnorePattern,
  GetProjectRoot,
} from '@rxap/workspace-utilities';
import { join } from 'path';

export function CoerceGitIgnore(tree: Tree, projectName: string) {

  const projectRoot = GetProjectRoot(tree, projectName);

  CoerceIgnorePattern(tree, join(projectRoot, '.gitignore'), [
    'docs',
  ]);

  CoerceIgnorePattern(tree, '.eslintignore', [
    'docs',
  ]);

}
