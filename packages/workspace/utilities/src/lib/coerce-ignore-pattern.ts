import { CoerceFile } from './coerce-file';
import { TreeLike } from './tree';

export function CoerceIgnorePattern(tree: TreeLike, filePath: string, patternList: string[]) {
  let content = CoerceFile(tree, filePath);

  for (const pattern of patternList) {
    if (!content.includes(pattern)) {
      content += `\n${ pattern }`;
    }
  }

  if (!content.endsWith('\n')) {
    content += '\n';
  }

  CoerceFile(tree, filePath, content, true);
}
