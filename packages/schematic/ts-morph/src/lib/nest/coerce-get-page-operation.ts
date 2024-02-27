import { camelize } from '@rxap/schematics-utilities';
import {
  CoerceClassMethod,
  CoerceImports,
  IsNormalizedOpenApiUpstreamOptions,
  NormalizedDataProperty,
  NormalizedUpstreamOptions,
  OperationIdToCommandClassImportPath,
  OperationIdToCommandClassName,
  OperationIdToResponseClassName,
  TypeImport,
} from '@rxap/ts-morph';
import {
  CoercePrefix,
  noop,
} from '@rxap/utilities';
import {
  ClassDeclaration,
  Project,
  Scope,
  SourceFile,
} from 'ts-morph';
import { CoerceTypeAlias } from '../ts-morph/coerce-type-alias';
import { WriteType } from '../ts-morph/write-type';
import { OperationOptions } from './add-operation-to-controller';
import { CoercePropertyDeclaration } from './coerce-dto-class';
import { CoerceUpstreamBasicOperationImplementation } from './coerce-get-by-id-operation';
import {
  CoerceOperation,
  CoerceOperationOptions,
} from './coerce-operation';
import { CoercePageDtoClass } from './coerce-page-dto-class';
import { CoerceRowDtoClass } from './coerce-row-dto-class';
import { TABLE_QUERY_LIST } from './table-query-list';

export interface GetPageOperationProperty extends NormalizedDataProperty {
  /**
   * the property name of the source object. if not defined the name will be used
   */
  source?: string;
}

export interface CoerceGetPageOperationOptions
  extends Omit<Omit<CoerceOperationOptions, 'operationName'>, 'tsMorphTransform'> {
  propertyList?: GetPageOperationProperty[];
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
    moduleSourceFile: SourceFile,
    options: CoerceGetPageOperationOptions,
  ) => void;
  upstream?: NormalizedUpstreamOptions | null;
}

export function GetPageOperationColumnToCodeText(property: GetPageOperationProperty): string {
  let propertyName = camelize(property.name);
  const prefixMatch = property.name.match(/^(_+)/);

  if (prefixMatch) {
    propertyName = camelize(property.name.replace(/^_+/, ''));
    propertyName = prefixMatch[0] + propertyName;
  }
  return `${ propertyName }: item.${ property.source ?? camelize(property.name) }`;
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
        type: WriteType({
          isArray: false,
          type: GetRawRowDataType(options),
        }, sourceFile),
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
        type: WriteType({
          isArray: true,
          type: GetRawRowDataType(options),
        }, sourceFile),
      },
    ],
    statements: [
      'return {',
      '  __rowId: ' +
      (options.rowIdProperty === null ?
        '(pageIndex * pageSize + index).toFixed(0)' :
        `item.${ options.rowIdProperty ?? 'uuid' }`) + ',\n  ',
      options.propertyList?.map(GetPageOperationColumnToCodeText).join(',\n  ') ?? '',
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
        type: WriteType({
          isArray: true,
          type: GetRawRowDataType(options),
        }, sourceFile),
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
  moduleSourceFile: SourceFile,
  options: CoerceGetPageOperationOptions,
) {
  const { upstream } = options;
  const statements: string[] = [];
  if (upstream && IsNormalizedOpenApiUpstreamOptions(upstream)) {
    const { memberName: commandMemberName } = CoerceUpstreamBasicOperationImplementation(
      sourceFile, classDeclaration, moduleSourceFile, upstream);
    const commandClassName = OperationIdToCommandClassName(upstream.operationId);
    const memberName = camelize(commandClassName);
    CoercePropertyDeclaration(classDeclaration, memberName, {
      type: commandClassName,
      scope: Scope.Private,
      hasExclamationToken: true,
      decorators: [
        {
          name: 'Inject',
          arguments: [ commandClassName ],
        },
      ],
    });
    CoerceImports(sourceFile, [
      {
        namedImports: [ commandClassName ],
        moduleSpecifier: OperationIdToCommandClassImportPath(upstream.operationId, upstream.scope, upstream.isService),
      }, {
        namedImports: [ 'Inject' ],
        moduleSpecifier: '@nestjs/common',
      },
    ]);
    statements.push(
      `const response = await this.${ memberName }.execute({
      parameters: {
        ${ upstream.mapper?.pageIndex ?? 'pageIndex' }: pageIndex,
        ${ upstream.mapper?.pageSize ?? 'pageSize' }: pageSize,
        ${ upstream.mapper?.sortBy ?? 'sortBy' }: sortBy,
        ${ upstream.mapper?.sortDirection ?? 'sortDirection' }: sortDirection,
        filter: ${ upstream.mapper?.filter ? `filter.map((item) => \`\${ item.column }:\${ item.filter }\`).join(';')` :
                   'filter' },
      },
    });`,
      'return {',
      `  list: response.${ upstream.mapper?.list ?? 'list' } ?? [],`,
      `  total: response.${ upstream.mapper?.total ?? 'total' } ?? 0,`,
      '};',
    );
  } else {
    statements.push(
      `const response = await ((() => { throw new NotImplementedException(); })() as any).execute({
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
    );
  }
  CoerceClassMethod(classDeclaration, 'getPageData', {
    scope: Scope.Public,
    returnType: `Promise<{ list: ${ WriteType({
      isArray: true,
      type: GetRawRowDataType(options),
    }, sourceFile) }, total: number }>`,
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
    statements: statements,
  });
}

export function GetResponseTypeFromUpstream(upstream: NormalizedUpstreamOptions): TypeImport {
  if (IsNormalizedOpenApiUpstreamOptions(upstream)) {
    return {
      name: OperationIdToResponseClassName(upstream.operationId),
      moduleSpecifier: OperationIdToCommandClassImportPath(upstream.operationId, upstream.scope, upstream.isService),
    };
  }
  throw new Error(`Upstream kind '${ upstream.kind }' not supported`);
}

export function GetRawRowDataType(options: Readonly<CoerceGetPageOperationOptions>): TypeImport {
  const { upstream } = options;
  if (upstream && IsNormalizedOpenApiUpstreamOptions(upstream)) {
    return GetResponseTypeFromUpstream(upstream);
  }
  return {
    name: 'RawRowData',
  };
}

export function CoerceGetPageOperation(options: Readonly<CoerceGetPageOperationOptions>) {
  const {
    operationName = 'get-page',
    rowIdProperty,
    tsMorphTransform = noop,
    propertyList,
    coerceToRowDtoMethod = CoerceToRowDtoMethod,
    coerceToPageDtoMethod = CoerceToPageDtoMethod,
    coerceGetPageDataMethod = CoerceGetPageDataMethod,
    upstream,
  } = options;
  let { responseDtoName } = options;

  return CoerceOperation({
    ...options,
    operationName,
    tsMorphTransform: (
      project,
      sourceFile,
      classDeclaration,
      controllerName,
      moduleSourceFile,
    ) => {

      if (!responseDtoName) {
        responseDtoName = controllerName;
      } else {
        responseDtoName = CoercePrefix(responseDtoName, controllerName + '-');
      }

      const {
        className: rowClassName,
        filePath: rowFilePath,
      } = CoerceRowDtoClass({
        project,
        name: responseDtoName,
        propertyList,
        rowIdType: rowIdProperty === null ? null : undefined,
      });

      const {
        className: pageClassName,
        filePath: pageFilePath,
      } = CoercePageDtoClass({
        project,
        name: responseDtoName,
        rowClassName,
        rowFilePath,
      });

      coerceGetPageDataMethod(sourceFile, classDeclaration, moduleSourceFile, options);
      coerceToRowDtoMethod(sourceFile, classDeclaration, rowClassName, options);
      coerceToPageDtoMethod(sourceFile, classDeclaration, pageClassName, rowClassName, options);

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

      if (!upstream || !IsNormalizedOpenApiUpstreamOptions(upstream)) {
        CoerceTypeAlias(sourceFile, 'RawRowData', {
          isExported: false,
          type: 'any',
        });
      }

      return {
        queryList: TABLE_QUERY_LIST,
        returnType: pageClassName,
        statements: [
          'const data = await this.getPageData(sortBy, sortDirection, pageSize, pageIndex, filter);',
          'return plainToInstance(',
          '  ' + pageClassName + ',',
          `  this.toPageDto(data.list, data.total, pageIndex, pageSize, sortBy, sortDirection, filter),`,
          '  classTransformOptions',
          ');',
        ],
        ...tsMorphTransform(project, sourceFile, classDeclaration, controllerName, pageClassName, rowClassName),
      };
    },
  });
}
