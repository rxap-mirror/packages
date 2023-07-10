import {
  ClassDeclaration,
  Project,
} from 'ts-morph';
import { FindNestModuleSourceFile } from './find-nest-module-source-file';
import { IsNestModuleClass } from './is-nest-module-class';

export function FindNestModuleDeclaration(project: Project, directory?: string): ClassDeclaration | undefined {
  const sourceFile = FindNestModuleSourceFile(project, directory);

  return sourceFile?.getClass(IsNestModuleClass);
}
