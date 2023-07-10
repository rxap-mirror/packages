import {CoerceOperation, CoerceOperationOptions} from './coerce-operation';
import {camelize, CoerceSuffix} from '@rxap/schematics-utilities';
import {CoercePageDtoClass} from './coerce-page-dto-class';
import {CoerceRowDtoClass} from './coerce-row-dto-class';
import {CoerceImports} from '../ts-morph/coerce-imports';
import {SchematicsException} from '@angular-devkit/schematics';

export interface CoerceGetPageOperationOptions extends Omit<CoerceOperationOptions, 'operationName'> {
  columnList: Array<{ name: string, type?: string }>;
}

export function CoerceGetPageOperation(options: Readonly<CoerceGetPageOperationOptions>) {
  let {tsMorphTransform, name, columnList, controllerName, nestController} = options;
  tsMorphTransform ??= () => ({});
  controllerName ??= nestController;
  controllerName ??= name;
  if (!controllerName) {
    throw new SchematicsException('No controller name provided!');
  }
  controllerName = CoerceSuffix(controllerName, '-table');
  return CoerceOperation({
    ...options,
    // TODO : remove after migration to controllerName
    name: controllerName,
    nestController: controllerName,
    controllerName,
    operationName: 'get-page',
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
        name: controllerName,
        propertyList: columnList.map(column => ({
          name: column.name,
          type: column.type ?? 'unknown',
        })),
      });

      const {
        className: pageClassName,
        filePath: pageFilePath,
      } = CoercePageDtoClass({
        project,
        name: controllerName,
        rowClassName,
        rowFilePath,
      });

      CoerceImports(sourceFile, [
        {
          namedImports: ['FilterQuery', 'FilterQueryPipe'],
          moduleSpecifier: '@eurogard/service-nest-utilities',
        },
        {
          namedImports: ['plainToInstance'],
          moduleSpecifier: 'class-transformer',
        },
        {
          namedImports: ['classTransformOptions'],
          moduleSpecifier: '@rxap/nest/class-transformer/options',
        },
        {
          namedImports: [pageClassName],
          moduleSpecifier: `..${pageFilePath}`,
        },
      ]);

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
            pipeList: ['new FilterQueryPipe()'],
          },
        ],
        returnType: pageClassName,
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
          `return plainToInstance(
      ${pageClassName},
      {
        total: response.maxCount ?? 0,
        pageIndex,
        pageSize,
        sortBy,
        sortDirection,
        filter,
        rows:
          response.entities?.map((item) => ({
            __rowId: item.uuid,
            __archived: item.__archived,
            __removedAt: item.__removedAt,
            ${columnList.map(column => `${camelize(column.name)}: item.${camelize(column.name)}`)
            .join(',\n            ')}
          })) ?? [],
      },
      classTransformOptions,
    );`,
        ],
        ...tsMorphTransform!(project, sourceFile, classDeclaration, controllerName),
      };
    },
  });
}
