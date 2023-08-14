import {
  camelize,
  CoerceSuffix,
} from '@rxap/schematics-utilities';
import { joinWithDash } from '@rxap/utilities';
import {
  ClassDeclaration,
  Project,
  Scope,
  SourceFile,
} from 'ts-morph';
import { CoerceClassMethod } from '../coerce-class-method';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { CoerceTypeAlias } from '../ts-morph/coerce-type-alias';
import { OperationOptions } from './add-operation-to-controller';
import {
  CoerceOperation,
  CoerceOperationOptions,
} from './coerce-operation';
import { CoercePageDtoClass } from './coerce-page-dto-class';
import { CoerceRowDtoClass } from './coerce-row-dto-class';
import { DtoClassProperty } from './create-dto-class';

export interface GetPageOperationColumn {
  name: string;
  type?: string;
  /**
   * the property name of the source object. if not defined the name will be used
   */
  source?: string;
}

export interface CoerceGetPageOperationOptions
  extends Omit<Omit<CoerceOperationOptions, 'operationName'>, 'tsMorphTransform'> {
  columnList: GetPageOperationColumn[];
  tsMorphTransform?: (
    project: Project,
    sourceFile: SourceFile,
    classDeclaration: ClassDeclaration,
    controllerName: string,
    pageClassName: string,
    rowClassName: string,
  ) => Partial<OperationOptions>;
  /**
   * the name of the property used as row id value. defaults to the value 'uuid'. If null the __rowId property will be
   * set to the absolute row index absolute row index = page * pageSize + rowIndex
   */
  rowIdProperty?: string | null;
  operationName?: string;
  /**
   * true - the suffix '-table' will not be enforced for the controller name
   */
  skipCoerceTableSuffix?: boolean;
  /**
   * The base name of the page and row DTO class name. Defaults to the controller name
   */
  responseDtoName?: string;
  coerceToRowDtoMethod?: (
    sourceFile: SourceFile,
    classDeclaration: ClassDeclaration,
    rowClassName: string,
    options: CoerceGetPageOperationOptions,
  ) => void;
  coerceToPageDtoMethod?: (
    sourceFile: SourceFile,
    classDeclaration: ClassDeclaration,
    pageClassName: string,
    rowClassName: string,
    options: CoerceGetPageOperationOptions,
  ) => void;
  coerceGetPageDataMethod?: (
    sourceFile: SourceFile,
    classDeclaration: ClassDeclaration,
    options: CoerceGetPageOperationOptions,
  ) => void;
}

export function GetPageOperationColumnToDtoClassProperty(column: GetPageOperationColumn): DtoClassProperty {
  return {
    name: column.name,
    type: column.type?.replace(/\[]$/, '').replace(/^Array<(.+)>/, '$1') ?? 'unknown',
    isArray: column.type?.endsWith('[]') || column.type?.startsWith('Array<'),
    isOptional: false,
    isType: false,
  };
}

export function GetPageOperationColumnToCodeText(column: GetPageOperationColumn): string {
  let propertyName = camelize(column.name);
  const prefixMatch = column.name.match(/^(_+)/);

  if (prefixMatch) {
    propertyName = camelize(column.name.replace(/^_+/, ''));
    propertyName = prefixMatch[0] + propertyName;
  }
  return `${ propertyName }: item.${ column.source ?? camelize(column.name) }`;
}

export function CoerceToRowDtoMethod(
  sourceFile: SourceFile,
  classDeclaration: ClassDeclaration,
  rowClassName: string,
  options: CoerceGetPageOperationOptions,
) {
  CoerceClassMethod(classDeclaration, 'toRowDto', {
    scope: Scope.Private,
    returnType: rowClassName,
    parameters: [
      {
        name: 'item',
        type: 'RawRowData',
      },
      {
        name: 'index',
        type: 'number',
      },
      {
        name: 'pageIndex',
        type: 'number',
      },
      {
        name: 'pageSize',
        type: 'number',
      },
      {
        name: 'list',
        type: 'RawRowData[]',
      },
    ],
    statements: [
      'return {',
      '  __rowId: ' +
      (options.rowIdProperty === null ?
        '(pageIndex * pageSize + index).toFixed(0)' :
        `item.${ options.rowIdProperty ?? 'uuid' }`) + ',\n  ',
      options.columnList.map(GetPageOperationColumnToCodeText).join(',\n  '),
      '};',
    ],
  });
}

export function CoerceToPageDtoMethod(
  sourceFile: SourceFile,
  classDeclaration: ClassDeclaration,
  pageClassName: string,
  rowClassName: string,
  options: CoerceGetPageOperationOptions,
) {
  CoerceClassMethod(classDeclaration, 'toPageDto', {
    scope: Scope.Private,
    returnType: pageClassName,
    parameters: [
      {
        name: 'list',
        type: 'RawRowData[]',
      },
      {
        name: 'total',
        type: 'number',
      },
      {
        name: 'pageIndex',
        type: 'number',
      },
      {
        name: 'pageSize',
        type: 'number',
      },
      {
        name: 'sortBy',
        type: 'string',
      },
      {
        name: 'sortDirection',
        type: 'string',
      },
      {
        name: 'filter',
        type: 'FilterQuery[]',
      },
    ],
    statements: [
      'return {',
      '  total, pageIndex, pageSize, sortBy, sortDirection, filter,',
      `  rows: list.map((item, index) => this.toRowDto(item, index, pageIndex, pageSize, list))`,
      '};',
    ],
  });
}

export function CoerceGetPageDataMethod(
  sourceFile: SourceFile,
  classDeclaration: ClassDeclaration,
  options: CoerceGetPageOperationOptions,
) {
  CoerceClassMethod(classDeclaration, 'getPageData', {
    scope: Scope.Public,
    returnType: 'Promise<{ list: RawRowData[], total: number }>',
    isAsync: true,
    parameters: [
      {
        name: 'sortBy',
        type: 'string',
      },
      {
        name: 'sortDirection',
        type: 'string',
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
        name: 'filter',
        type: 'FilterQuery[]',
      },
    ],
    statements: [
      `const response = await ((() => { throw new NotImplementedException() })() as any).execute({
      parameters: {
        page: pageIndex,
        size: pageSize,
        sort: sortBy,
        order: sortDirection,
        filter: filter.map((item) => \`\${ item.column }:\${ item.filter }\`).join(';'),
      },
    });`,
      'return {',
      '  list: response.entities ?? [],',
      '  total: response.maxCount ?? 0,',
      '};',
    ],
  });
}

export function CoerceGetPageOperation(options: Readonly<CoerceGetPageOperationOptions>) {
  let {
    skipCoerceTableSuffix,
    operationName,
    rowIdProperty,
    tsMorphTransform,
    columnList,
    controllerName,
    responseDtoName,
    context,
    coerceToRowDtoMethod,
    coerceToPageDtoMethod,
    coerceGetPageDataMethod,
  } = options;
  tsMorphTransform ??= () => ({});
  controllerName = skipCoerceTableSuffix ? controllerName : CoerceSuffix(controllerName, '-table');
  operationName ??= 'get-page';
  responseDtoName ??= joinWithDash([ context, controllerName ]);
  coerceToRowDtoMethod ??= CoerceToRowDtoMethod;
  coerceToPageDtoMethod ??= CoerceToPageDtoMethod;
  coerceGetPageDataMethod ??= CoerceGetPageDataMethod;
  return CoerceOperation({
    ...options,
    controllerName,
    operationName,
    tsMorphTransform: (
      project,
      sourceFile,
      classDeclaration,
      controllerName,
    ) => {

      const {
        className: rowClassName,
        filePath: rowFilePath,
      } = CoerceRowDtoClass({
        project,
        name: responseDtoName!,
        propertyList: columnList.map(GetPageOperationColumnToDtoClassProperty),
        rowIdType: rowIdProperty === null ? null : undefined,
      });

      const {
        className: pageClassName,
        filePath: pageFilePath,
      } = CoercePageDtoClass({
        project,
        name: responseDtoName!,
        rowClassName,
        rowFilePath,
      });

      coerceGetPageDataMethod!(sourceFile, classDeclaration, options);
      coerceToRowDtoMethod!(sourceFile, classDeclaration, rowClassName, options);
      coerceToPageDtoMethod!(sourceFile, classDeclaration, pageClassName, rowClassName, options);

      CoerceImports(sourceFile, [
        {
          namedImports: [ 'FilterQuery', 'FilterQueryPipe' ],
          moduleSpecifier: '@rxap/nest-utilities',
        },
        {
          namedImports: [ 'plainToInstance' ],
          moduleSpecifier: 'class-transformer',
        },
        {
          namedImports: [ 'classTransformOptions' ],
          moduleSpecifier: '@rxap/nest-utilities',
        },
        {
          namedImports: [ pageClassName ],
          moduleSpecifier: pageFilePath,
        },
        {
          namedImports: [ rowClassName ],
          moduleSpecifier: rowFilePath,
        },
      ]);

      CoerceTypeAlias(sourceFile, 'RawRowData', {
        isExported: false,
        type: 'any',
      });

      return {
        queryList: [
          {
            name: 'pageIndex',
            type: 'number',
            defaultValue: '0',
          },
          {
            name: 'pageSize',
            type: 'number',
            defaultValue: '5',
          },
          {
            name: 'sortDirection',
            type: 'string',
            defaultValue: w => w.quote('desc'),
          },
          {
            name: 'sortBy',
            type: 'string',
            defaultValue: w => w.quote('__updatedAt'),
          },
          {
            name: 'filter',
            type: 'FilterQuery[]',
            pipeList: [ 'new FilterQueryPipe()' ],
          },
        ],
        returnType: pageClassName,
        statements: [
          'const data = await this.getPageData(sortBy, sortDirection, pageSize, pageIndex, filter);',
          'return plainToInstance(',
          '  ' + pageClassName + ',',
          `  this.toPageDto(data.list, data.total, pageIndex, pageSize, sortBy, sortDirection, filter),`,
          '  classTransformOptions',
          ');',
        ],
        ...tsMorphTransform!(project, sourceFile, classDeclaration, controllerName, pageClassName, rowClassName),
      };
    },
  });
}
