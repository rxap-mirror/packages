import {
  Project,
  SourceFile
} from 'ts-morph';
import { classify } from '@rxap/utilities';

export function FindComponentSourceFile(name: string, project: Project): SourceFile {
  return project.getSourceFileOrThrow(sourceFile => !!sourceFile.getClass(classify(name) + 'Component'));
}
