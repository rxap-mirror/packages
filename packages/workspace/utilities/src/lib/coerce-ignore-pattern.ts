import {
  TreeAdapter,
  TreeLike,
} from './tree';

export function CoerceIgnorePattern(tree: TreeLike, filePath: string, patternList: string[]) {
  const treeAdapter = new TreeAdapter(tree);
  if (!tree.exists(filePath)) {
    treeAdapter.write(filePath, '');
  }

  if (!treeAdapter.isFile(filePath)) {
    throw new Error(`The path: ${ filePath } is not a file`);
  }

  let content = treeAdapter.read(filePath)!.toString('utf-8');

  for (const pattern of patternList) {
    if (!content.includes(pattern)) {
      content += `\n${ pattern }`;
    }
  }

  if (!content.endsWith('\n')) {
    content += '\n';
  }

  treeAdapter.write(filePath, content);

}
