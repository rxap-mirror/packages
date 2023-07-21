import { CoerceSuffix } from '@rxap/schematics-utilities';
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
      namedImports: [ 'PageDto' ],
      moduleSpecifier: '@rxap/nest-utilities',
    },
    {
      namedImports: [ rowClassName ],
      moduleSpecifier: `./${ basename(rowFilePath) }`,
    },
  );
  classStructure ??= {};
  classStructure.extends = `PageDto<${ rowClassName }>`;
  propertyList ??= [
    {
      name: 'rows',
      type: rowClassName,
      isArray: true,
      isType: true,
    },
  ];
  propertyList.push();
  return CoerceDtoClass({
    project,
    name: CoerceSuffix(name, '-page'),
    propertyList,
    classStructure,
    importStructureList,
  });
}
