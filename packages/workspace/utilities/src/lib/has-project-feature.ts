import { join } from 'path';
import { GetProjectRoot } from './get-project';
import {
  TreeAdapter,
  TreeLike,
} from './tree';

export function HasMigrations(tree: TreeLike, project: { name: string }): boolean {
  const treeAdapter = new TreeAdapter(tree);
  const projectRoot = GetProjectRoot(tree, project.name);
  return treeAdapter.exists(join(projectRoot, 'migrations.json')) ||
         treeAdapter.exists(join(projectRoot, 'src', 'migrations'));
}
