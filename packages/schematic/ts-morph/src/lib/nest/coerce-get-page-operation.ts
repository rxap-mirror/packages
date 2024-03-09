import { camelize } from '@rxap/schematics-utilities';
import {
  CoerceClassMethod,
  CoerceImports,
  CoercePropertyDeclaration,
  DataProperty,
  IsNormalizedOpenApiUpstreamOptions,
  IsNormalizedPagedRequestMapper,
  NormalizedUpstreamOptions,
  OperationIdToCommandClassImportPath,
  OperationIdToResponseClassImportPath,
  OperationIdToResponseClassName,
  TypeImport,
} from '@rxap/ts-morph';
import {
  coerceArray,
  noop,
} from '@rxap/utilities';
import {
  ClassDeclaration,
  Project,
  Scope,
  SourceFile,
  WriterFunction,
  Writers,
} from 'ts-morph';
import { CoerceTypeAlias } from '../ts-morph/coerce-type-alias';
import { WriteType } from '../ts-morph/write-type';
import { OperationOptions } from './add-operation-to-controller';
import { CoerceDtoClassOutput } from './coerce-dto-class';
import {
  BuildOperationDtoClassName,
  CoerceOperation,
  CoerceOperationOptions,
  CoerceUpstreamBasicOperationImplementation,
  TransformOperation,
} from './coerce-operation';
import {
  BuildPageDtoClassName,
  CoercePageDtoClass,
} from './coerce-page-dto-class';
import {
  BuildRowDtoClassName,
  CoerceRowDtoClass,
} from './coerce-row-dto-class';
import { DtoClassProperty } from './dto-class-property';
import { TABLE_QUERY_LIST } from './table-query-list';

export interface CoerceGetPageOperationOptions
  extends Omit<CoerceOperationOptions, 'operationName' | 'tsMorphTransform' | 'coerceOperationDtoClass'> {
  tsMorphTransform?: (
    project: Project,
    sourceFile: SourceFile,
    classDeclaration: ClassDeclaration,
    controllerName: string,
    moduleSourceFile: SourceFile,
    pageClassName: string,
    rowClassName: string,
  ) => Partial<OperationOptions>;
  /**
   * the name of the property used as row id value. defaults to the value 'uuid'. If null the __rowId property will be
   * set to the absolute row index absolute row index = page * pageSize + rowIndex
   */
  rowIdProperty?: DataProperty;
  operationName?: string;
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
  coerceOperationDtoClass?: (
    classDeclaration: ClassDeclaration,
    controllerName: string,
    moduleSourceFile: SourceFile,
    options: Readonly<CoerceGetPageOperationOptions>,
  ) => CoerceDtoClassOutput | null;
  upstream?: NormalizedUpstreamOptions | null;
}

export function GetPageOperationColumnToCodeText(property: DtoClassProperty): string {
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
      (!options.rowIdProperty ?
        '(pageIndex * pageSize + index).toFixed(0)' :
        `item.${ options.rowIdProperty.name }`) + ',\n  ',
      options.propertyList?.filter(p => p.name !== '__rowId').map(GetPageOperationColumnToCodeText).join(',\n  ') ?? '',
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
    const { memberName, className: commandClassName } = CoerceUpstreamBasicOperationImplementation(classDeclaration, moduleSourceFile, upstream);
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
    let pageIndex = 'pageIndex';
    let pageSize = 'pageSize';
    let sortBy = 'sortBy';
    let sortDirection = 'sortDirection';
    let filter: { eq: string, join: string } | null = null;
    let list = 'list';
    let total = 'total';
    const { mapper } = upstream;
    if (mapper && IsNormalizedPagedRequestMapper(mapper)) {
      pageIndex = mapper.pageIndex ?? pageIndex;
      pageSize = mapper.pageSize ?? pageSize;
      sortBy = mapper.sortBy ?? sortBy;
      sortDirection = mapper.sortDirection ?? sortDirection;
      filter = mapper.filter ?? filter;
      list = mapper.list ?? list;
      total = mapper.total ?? total;
    }
    statements.push(
      `const response = await this.${ memberName }.execute({
      parameters: {
        ${ pageIndex }: pageIndex,
        ${ pageSize }: pageSize,
        ${ sortBy }: sortBy,
        ${ sortDirection }: sortDirection,
        filter: ${
        filter ?
        `filter.map((item) => \`\${ item.column }${ filter.eq }\${ item.filter }\`).join('${ filter.join }')` :
        'filter'
      },
      },
    });`,
      'return {',
      `  list: response.${ list } ?? [],`,
      `  total: response.${ total } ?? 0,`,
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
    returnType: w => {
      w.write('Promise<');
      Writers.object({
        list: WriteType({
          isArray: true,
          type: GetRawRowDataType(options),
        }, sourceFile),
        total: 'number',
      })(w);
      w.write('>');
    },
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
    const { mapper } = upstream;
    let list = 'list';
    if (mapper && IsNormalizedPagedRequestMapper(mapper)) {
      list = mapper.list ?? list;
    }
    const className = OperationIdToResponseClassName(upstream.operationId);
    return {
      name: `${className}['${list}'][number]`,
      namedImport: className,
      moduleSpecifier: OperationIdToResponseClassImportPath(upstream.operationId, upstream.scope),
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

export function BuildGetPageUpstreamGetDataImplementation(
  classDeclaration: ClassDeclaration,
  moduleSourceFile: SourceFile,
  dto: CoerceDtoClassOutput | null,
  options: Readonly<CoerceOperationOptions>,
): TransformOperation {
  return (operationOptions) => {
    operationOptions.statements ??= [];
    operationOptions.statements = coerceArray(operationOptions.statements);
    operationOptions.statements.push('const data = await this.getPageData(sortBy, sortDirection, pageSize, pageIndex, filter);',);
  };
}

export function CoerceGetPageOperationDtoClass(
  classDeclaration: ClassDeclaration,
  controllerName: string,
  moduleSourceFile: SourceFile,
  options: Readonly<CoerceGetPageOperationOptions>,
): CoerceDtoClassOutput | null {
  const sourceFile = classDeclaration.getSourceFile();
  const project = sourceFile.getProject();
  const {
    rowIdProperty,
    propertyList,
    coerceToRowDtoMethod = CoerceToRowDtoMethod,
    coerceToPageDtoMethod = CoerceToPageDtoMethod,
    coerceGetPageDataMethod = CoerceGetPageDataMethod,
    buildOperationDtoClassName = BuildOperationDtoClassName,
    dtoClassName = buildOperationDtoClassName(controllerName, options)
  } = options;

  const {
    className: rowClassName,
    filePath: rowFilePath,
  } = CoerceRowDtoClass({
    project,
    name: dtoClassName,
    propertyList,
    rowIdType: rowIdProperty?.type,
  });

  CoerceImports(sourceFile, {
    namedImports: [ rowClassName ],
    moduleSpecifier: rowFilePath,
  });

  const dto = CoercePageDtoClass({
    project,
    name: dtoClassName,
    rowClassName,
    rowFilePath,
  });

  const { className: pageClassName } = dto;

  coerceGetPageDataMethod(sourceFile, classDeclaration, moduleSourceFile, options);
  coerceToRowDtoMethod(sourceFile, classDeclaration, rowClassName, options);
  coerceToPageDtoMethod(sourceFile, classDeclaration, pageClassName, rowClassName, options);

  return dto;

}

export function BuiltGetPageDtoDataMapperImplementation(
  classDeclaration: ClassDeclaration,
  moduleSourceFile: SourceFile,
  dto: CoerceDtoClassOutput | null,
  options: Readonly<CoerceOperationOptions>,
): TransformOperation<string | WriterFunction> {
  return () => {
    return 'this.toPageDto(data.list, data.total, pageIndex, pageSize, sortBy, sortDirection, filter)';
  };
}

export function CoerceGetPageOperation(options: Readonly<CoerceGetPageOperationOptions>) {
  const {
    operationName = 'get-page',
    tsMorphTransform = noop,
    upstream,
    builtDtoDataMapperImplementation = BuiltGetPageDtoDataMapperImplementation,
    coerceOperationDtoClass = CoerceGetPageOperationDtoClass,
    buildUpstreamGetDataImplementation = BuildGetPageUpstreamGetDataImplementation,
  } = options;

  return CoerceOperation<CoerceGetPageOperationOptions>({
    ...options,
    operationName,
    builtDtoDataMapperImplementation,
    coerceOperationDtoClass,
    buildUpstreamGetDataImplementation,
    tsMorphTransform: (
      project,
      sourceFile,
      classDeclaration,
      controllerName,
      moduleSourceFile,
    ) => {

      if (!upstream || !IsNormalizedOpenApiUpstreamOptions(upstream)) {
        CoerceTypeAlias(sourceFile, 'RawRowData', {
          isExported: false,
          type: 'any',
        });
      }

      return {
        queryList: TABLE_QUERY_LIST,
        ...tsMorphTransform(project, sourceFile, classDeclaration, controllerName, moduleSourceFile, BuildPageDtoClassName(BuildOperationDtoClassName(controllerName, options)), BuildRowDtoClassName(BuildOperationDtoClassName(controllerName, options))),
      };
    },
  });
}
