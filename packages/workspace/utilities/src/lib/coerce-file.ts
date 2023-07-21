import {
  TreeAdapter,
  TreeLike,
} from './tree';

export function CoerceFile<Tree extends TreeLike>(
  tree: TreeLike,
  filePath: string,
  content: string | Buffer,
  overwrite = true,
): string {
  const treeAdapter = new TreeAdapter(tree);
  if (tree.exists(filePath)) {
    if (overwrite) {
      treeAdapter.overwrite(filePath, content);
    }
  } else {
    treeAdapter.create(filePath, content);
  }
  return treeAdapter.read(filePath)!.toString('utf-8');
}
