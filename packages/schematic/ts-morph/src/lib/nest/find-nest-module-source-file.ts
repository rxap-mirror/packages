import {
  Project,
  SourceFile,
} from 'ts-morph';
import { HasNestModuleClass } from './has-nest-module-class';

export function FindNestModuleSourceFile(project: Project, directory?: string): SourceFile | undefined {
  return project.getSourceFile(file =>
    (!directory || file.getDirectoryPath() === directory) &&
    HasNestModuleClass(file),
  );
}
