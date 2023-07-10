import {Project} from 'ts-morph';
import {join} from 'path';

export function GenerateIndexExports(project: Project) {

  const exports: string[] = [];

  for (const sourceFile of project.getSourceFiles()) {

    sourceFile.getDirectoryPath();

    exports.push(`export * from '.${join('/lib', sourceFile.getDirectoryPath(), sourceFile.getBaseNameWithoutExtension())}';`);

  }

  return exports.join('\n');

}
