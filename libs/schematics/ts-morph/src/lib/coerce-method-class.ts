import { SourceFile } from 'ts-morph';
import {
  AddMethodClass,
  AddMethodClassOptions
} from './add-method-class';
import { CoerceSuffix } from '@rxap/utilities';

export function CoerceMethodClass(
  sourceFile: SourceFile,
  name: string,
  options: AddMethodClassOptions = {}
) {

  name = CoerceSuffix(name, 'Method');

  const hasClass = !!sourceFile.getClass(name);

  if (!hasClass) {
    AddMethodClass(sourceFile, name, options);
  }

}
