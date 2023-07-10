import {ClassDeclarationStructure, ImportDeclarationStructure, OptionalKind, Project} from 'ts-morph';
import {CoerceDtoClass} from './coerce-dto-class';
import {CoerceSuffix} from '@rxap/schematics-utilities';
import {DtoClassProperty} from '../create-dto-class';

export interface CoerceRowDtoClassOptions {
  project: Project,
  name: string,
  propertyList?: DtoClassProperty[],
  classStructure?: Omit<OptionalKind<ClassDeclarationStructure>, 'name'>,
  importStructureList?: Array<OptionalKind<ImportDeclarationStructure>>,
}

export function CoerceRowDtoClass(options: CoerceRowDtoClassOptions) {
  let {project, name, propertyList, classStructure, importStructureList} = options;
  propertyList ??= [];
  propertyList.push(
    {name: '__rowId', type: 'string'},
    {name: '__archived', type: 'boolean'},
    {name: '__removedAt', type: 'string', isOptional: true},
  );
  return CoerceDtoClass(
    project,
    CoerceSuffix(name, '-row'),
    propertyList,
  );
}
