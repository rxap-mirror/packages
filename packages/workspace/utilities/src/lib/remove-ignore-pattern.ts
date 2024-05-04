import {
  TreeAdapter,
  TreeLike,
} from '@rxap/workspace-utilities';

export function RemoveIgnorePattern(tree: TreeLike, filePath: string, patternList: string[]) {
  const treeAdapter = new TreeAdapter(tree);
  if (!tree.exists(filePath)) {
    return;
  }

  if (!treeAdapter.isFile(filePath)) {
    throw new Error(`The path: ${ filePath } is not a file`);
  }

  let content = treeAdapter.read(filePath)!.toString('utf-8');

  for (const pattern of patternList) {
    content = content.split('\n').filter((line) => line.trim() !== pattern).join('\n');
  }

  treeAdapter.write(filePath, content);

}
