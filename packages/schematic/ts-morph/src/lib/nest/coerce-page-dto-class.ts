import { CoerceSuffix } from '@rxap/schematics-utilities';
import { CoerceImports } from '@rxap/ts-morph';
import {
  CoerceArrayItems,
  noop,
} from '@rxap/utilities';
import { basename } from 'path';
import {
  CoerceDtoClass,
  CoerceDtoClassOptions,
} from './coerce-dto-class';

export interface CoercePageDtoClassOptions extends CoerceDtoClassOptions {
  rowClassName: string,
  rowFilePath: string,
}

export function BuildPageDtoClassName(name: string): string {
  return CoerceSuffix(name, '-page');
}

export function CoercePageDtoClass(options: CoercePageDtoClassOptions) {
  const {
    project,
    name,
    propertyList= [],
    rowClassName,
    rowFilePath,
    tsMorphTransform = noop,
  } = options;
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
  ], (a, b) => a.name === b.name);
  return CoerceDtoClass({
    ...options,
    project,
    name: BuildPageDtoClassName(name),
    propertyList,
    tsMorphTransform: (p, sourceFile, classDeclaration) => {
      CoerceImports(sourceFile, [
        {
          namedImports: [ rowClassName ],
          moduleSpecifier: `./${ basename(rowFilePath) }`,
        },
        {
          namedImports: [ 'FilterQueryDto' ],
          moduleSpecifier: '@rxap/nest-dto',
        }
      ]);
      tsMorphTransform(p, sourceFile, classDeclaration);
    }
  });
}
