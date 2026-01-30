import {
  Project,
  SourceFile,
} from 'ts-morph';
import { HasNestModuleClass } from './has-nest-module-class';

/**
 * Finds a NestJS module source file in the project.
 *
 * @param project - The ts-morph project.
 * @param directory - The directory to search in.
 * @returns The source file containing the module, or undefined if not found.
 */
export function FindNestModuleSourceFile(project: Project, directory?: string): SourceFile | undefined {
  return project.getSourceFile(file =>
    (!directory || file.getDirectoryPath() === directory) &&
    HasNestModuleClass(file),
  );
}
