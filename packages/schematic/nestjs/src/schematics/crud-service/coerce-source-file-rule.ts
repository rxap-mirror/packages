import { Rule } from '@angular-devkit/schematics';
import { join } from 'path';
import {
  Project,
  SourceFile,
} from 'ts-morph';

/**
 *
 * @param project A ts-morph project instance
 * @param filePath The absolute file path with extension
 * @param basePath The basePath in the schematics file Tree
 * @param initializer A initializer function called with the SourceFile instance
 * if the file does not exists in the schematics file Tree
 */
export function CoerceSourceFileRule(
  project: Project,
  filePath: string,
  basePath: string,
  initializer?: (sourceFile: SourceFile) => void,
): Rule {
  return tree => {

    let content = '';

    const treeFilePath = join(basePath, filePath);

    let exists = false;

    if (tree.exists(treeFilePath)) {
      exists = true;
      content = tree.get(treeFilePath)!.content.toString('utf-8');
    }

    const sourceFile = project.createSourceFile(filePath, content, { overwrite: true });

    if (!exists && initializer) {
      initializer(sourceFile);
    }

  };
}
