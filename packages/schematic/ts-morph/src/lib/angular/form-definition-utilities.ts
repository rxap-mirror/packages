import {
  classify,
  CoerceSuffix,
} from '@rxap/schematics-utilities';
import { CoerceClass } from '@rxap/ts-morph';
import { dasherize } from '@rxap/utilities';
import { SourceFile } from 'ts-morph';

export interface GetFormDefinitionClassNameOptions {
  name: string;
}

export function GetFormDefinitionClassName({ name }: GetFormDefinitionClassNameOptions) {
  return CoerceSuffix(classify(name), 'Form');
}

export type GetFormDefinitionInterfaceNameOptions = GetFormDefinitionClassNameOptions

export function GetFormDefinitionInterfaceName(options: GetFormDefinitionInterfaceNameOptions) {
  const className = GetFormDefinitionClassName(options);
  return `I${ className }`;
}

export type CoerceFormDefinitionClassOptions = GetFormDefinitionClassNameOptions

export function CoerceFormDefinitionClass(sourceFile: SourceFile, options: CoerceFormDefinitionClassOptions) {
  const className = GetFormDefinitionClassName(options);
  return CoerceClass(sourceFile, className, { isExported: true });
}

export type GetFormDefinitionFileNameOptions = GetFormDefinitionClassNameOptions

export function GetFormDefinitionFileName({ name }: GetFormDefinitionFileNameOptions) {
  return CoerceSuffix(dasherize(name), '.form.ts');
}

export function GetFormDefinitionFileImportPath(options: GetFormDefinitionFileNameOptions) {
  return './' + GetFormDefinitionFileName(options).replace(/\.ts$/, '');
}

export type GetFormDefinitionFilePathOptions = GetFormDefinitionFileNameOptions;

export function GetFormDefinitionFilePath(options: GetFormDefinitionFileNameOptions) {
  return '/' + GetFormDefinitionFileName(options) + '?';
}
