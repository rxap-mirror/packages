import {
  SourceFile,
  OptionalKind,
  ImportDeclarationStructure
} from 'ts-morph';
import { AddMethodClass } from './add-method-class';
import { CoerceSuffix } from '@rxap/utilities';

export function CoerceMethodClass(
  sourceFile: SourceFile,
  name: string,
  structures: ReadonlyArray<OptionalKind<ImportDeclarationStructure>> = [],
  returnType: string                                                  = 'any',
  parameterType: string                                               = 'any',
  isAsync?: boolean
) {

  name = CoerceSuffix(name, 'Method');

  const hasClass = !!sourceFile.getClass(name);

  if (!hasClass) {
    AddMethodClass(sourceFile, name, structures, returnType, parameterType, isAsync);
  }

}
