import { CoerceSuffix } from '@rxap/schematics-utilities';
import { CoerceArrayItems } from '@rxap/utilities';
import { basename } from 'path';
import {
  ClassDeclarationStructure,
  ImportDeclarationStructure,
  OptionalKind,
  Project,
} from 'ts-morph';
import { CoerceDtoClass } from './coerce-dto-class';
import { DtoClassProperty } from './create-dto-class';

export interface CoercePageDtoClassOptions {
  project: Project,
  name: string,
  propertyList?: DtoClassProperty[],
  classStructure?: Omit<OptionalKind<ClassDeclarationStructure>, 'name'>,
  importStructureList?: Array<OptionalKind<ImportDeclarationStructure>>,
  rowClassName: string,
  rowFilePath: string,
}

export function CoercePageDtoClass(options: CoercePageDtoClassOptions) {
  let {
    project,
    name,
    propertyList,
    classStructure,
    importStructureList,
    rowClassName,
    rowFilePath,
  } = options;
  importStructureList ??= [];
  importStructureList.push(
    {
      namedImports: [ rowClassName ],
      moduleSpecifier: `./${ basename(rowFilePath) }`,
    },
    {
      namedImports: [ 'FilterQueryDto' ],
      moduleSpecifier: '@rxap/nest-dto',
    }
  );
  classStructure ??= {};
  propertyList ??= [];
  CoerceArrayItems(propertyList, [
    {
      name: 'rows',
      type: rowClassName,
      isArray: true,
      isType: true,
    },
    {
      name: 'pageSize',
      type: 'number',
    },
    {
      name: 'pageIndex',
      type: 'number',
    },
    {
      name: 'total',
      type: 'number',
    },
    {
      name: 'sortDirection',
      type: 'string',
      isOptional: true,
    },
    {
      name: 'sortBy',
      type: 'string',
      isOptional: true,
    },
    {
      name: 'filter',
      type: 'FilterQueryDto',
      isArray: true,
      isType: true,
      isOptional: true,
    }
  ]);
  return CoerceDtoClass({
    project,
    name: CoerceSuffix(name, '-page'),
    propertyList,
    classStructure,
    importStructureList,
  });
}
