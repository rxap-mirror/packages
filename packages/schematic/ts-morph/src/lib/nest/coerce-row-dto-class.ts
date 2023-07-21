import {
  ClassDeclarationStructure,
  ImportDeclarationStructure,
  OptionalKind,
  Project,
} from 'ts-morph';
import { DtoClassProperty } from '../create-dto-class';
import { CoerceDtoClass } from './coerce-dto-class';
import { CoerceSuffix } from '@rxap/schematics-utilities';

export interface CoerceRowDtoClassOptions {
  project: Project,
  name: string,
  propertyList?: DtoClassProperty[],
  classStructure?: Omit<OptionalKind<ClassDeclarationStructure>, 'name'>,
  importStructureList?: Array<OptionalKind<ImportDeclarationStructure>>,
  /**
   * the type of the property used as row id type. defaults to the type 'string'. If null the type will be
   * set to number
   */
  rowIdType?: string | null;
}

export function CoerceRowDtoClass(options: CoerceRowDtoClassOptions) {
  let {
    rowIdType,
    project,
    name,
    propertyList,
    classStructure,
    importStructureList,
  } = options;
  propertyList ??= [];
  propertyList.unshift(
    {
      name: '__rowId',
      type: rowIdType === null ? 'number' : rowIdType ?? 'string',
    },
  );
  return CoerceDtoClass(
    project,
    CoerceSuffix(name, '-row'),
    propertyList,
  );
}
