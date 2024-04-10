import { Tree } from '@nx/devkit';
import { YamlMergeFunction } from '@rxap/workspace-utilities';
import { basename } from 'path';

// TODO : move to utility package
export function mergeYaml(tree: Tree, filePath: string, newContent: string) {
  const currentContent = tree.exists(filePath) ? tree.read(filePath, 'utf-8') : undefined;
  const mergedContent = YamlMergeFunction(currentContent, newContent, basename(filePath), filePath);
  tree.write(filePath, mergedContent);
}
