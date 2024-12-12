import { Tree } from '@nx/devkit';
import {
  CoerceIgnorePattern,
  GetProjectRoot,
} from '@rxap/workspace-utilities';
import { join } from 'path';

export function CoerceGitIgnore(tree: Tree, projectName: string) {

  const projectRoot = GetProjectRoot(tree, projectName);

  CoerceIgnorePattern(tree, join(projectRoot, '.gitignore'), [
    'compodoc',
  ]);

  CoerceIgnorePattern(tree, '.eslintignore', [
    'compodoc',
  ]);

  CoerceIgnorePattern(tree, join(projectRoot, '.eslintignore'), [
    'compodoc',
  ]);

}
