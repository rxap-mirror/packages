import {
  CoerceFile,
  TreeAdapter,
  TreeLike,
} from '@rxap/workspace-utilities';

export function RemoveIgnorePattern(tree: TreeLike, filePath: string, patternList: string[]) {
  if (!tree.exists(filePath)) {
    return;
  }

  let content = CoerceFile(tree, filePath);

  for (const pattern of patternList) {
    content = content.split('\n').filter((line) => line.trim() !== pattern).join('\n');
  }

  CoerceFile(tree, filePath, content, true);

}
