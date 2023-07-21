import { classify } from '@rxap/schematics-utilities';
import {
  Project,
  SourceFile,
} from 'ts-morph';

export function FindComponentModuleSourceFile(name: string, project: Project): SourceFile {
  return project.getSourceFileOrThrow(sourceFile => !!sourceFile.getClass(classify(name) + 'ComponentModule'));
}
