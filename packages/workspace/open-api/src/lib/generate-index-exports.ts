import { join } from 'path';
import { Project } from 'ts-morph';

/**
 * Generates a string of export statements for all source files within a given project.
 * Each export statement is formatted to export all members from the respective source file.
 *
 * @param {Project} project - The project from which to generate export statements.
 * @returns {string} A single string containing newline-separated export statements for each source file in the project.
 *
 * @example
 * // Assuming the project has source files in 'src/lib/Example.ts' and 'src/lib/Utils.ts'
 * const projectExports = GenerateIndexExports(project);
 * console.log(projectExports);
 * // Output:
 * // export * from './lib/Example';
 * // export * from './lib/Utils';
 */
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
