import {
  classify,
  CoerceSuffix,
} from '@rxap/schematics-utilities';
import { SourceFile } from 'ts-morph';
import { CoerceClass } from '../coerce-class';
import { dasherize } from '@rxap/utilities';

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

export type GetFormDefinitionFilePathOptions = GetFormDefinitionFileNameOptions;

export function GetFormDefinitionFilePath(options: GetFormDefinitionFileNameOptions) {
  return '/' + GetFormDefinitionFileName(options) + '?';
}
