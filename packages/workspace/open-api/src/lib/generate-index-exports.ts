import { join } from 'path';
import { Project } from 'ts-morph';

export function GenerateIndexExports(project: Project) {

  const exports: string[] = [];

  for (const sourceFile of project.getSourceFiles()) {

    sourceFile.getDirectoryPath();

    exports.push(`export * from '.${ join(
      '/lib',
      sourceFile.getDirectoryPath(),
      sourceFile.getBaseNameWithoutExtension(),
    ) }';`);

  }

  return exports.join('\n');

}
