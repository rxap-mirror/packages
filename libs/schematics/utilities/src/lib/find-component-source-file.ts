import {
  Project,
  SourceFile
} from 'ts-morph';
import {
  classify,
  CoerceSuffix
} from '@rxap/utilities';

export function FindComponentSourceFile(name: string, project: Project): SourceFile {
  return project.getSourceFileOrThrow(sourceFile => !!sourceFile.getClass(CoerceSuffix(classify(name), 'Component')));
}
