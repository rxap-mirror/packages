import { chain } from '@angular-devkit/schematics';
import {
  BuildNestControllerName,
  buildOperationId,
  CoerceDecorator,
  CoerceFormControl,
  CoerceFormDefinitionControl,
  CoerceFormProviderRule,
  CoerceImports,
  CoerceTableDataSourceRule,
  CoerceTableSelectOperationRule,
  CoerceTableSelectResolveValueMethodRule,
  CoerceTableSelectValueResolveOperationRule,
  EnforceUseFormControlOrderRule,
  FormDefinitionControl,
} from '@rxap/schematics-ts-morph';
import {
  capitalize,
  classify,
  dasherize,
  ExecuteSchematic,
} from '@rxap/schematics-utilities';
import {
  joinWithDash,
  Normalized,
} from '@rxap/utilities';
import { join } from 'path';
import {
  ClassDeclaration,
  SourceFile,
  WriterFunction,
  Writers,
} from 'ts-morph';
import { PrintAngularOptions } from '../../../../lib/angular-options';
import {
  NormalizedTableColumn,
  NormalizeTableColumnList,
} from '../../../../lib/table-column';
import { TableColumnToGetPageOperationColumn } from '../../../table/table-component';
import {
  NormalizedFormControlOptions,
  NormalizeFormControlOptions,
} from '../../form-control';
import { TableSelectFormControlOptions } from './schema';

export interface NormalizedTableSelectFormControlOptions
  extends Omit<Readonly<Normalized<TableSelectFormControlOptions> & NormalizedFormControlOptions>, 'columnList'> {
  columnList: NormalizedTableColumn[];
}

export function NormalizeTableSelectFormControlOptions(
  options: TableSelectFormControlOptions,
): NormalizedTableSelectFormControlOptions {
  const normalizedOptions = NormalizeFormControlOptions(options);
  let { isArray } = normalizedOptions;
  const multiple = options.multiple ?? false;
  isArray = multiple ? true : isArray;
  const columnList = NormalizeTableColumnList(options.columnList);
  return Object.seal({
    ...normalizedOptions,
    isArray,
    multiple,
    columnList,
  });
}

export function TableColumnToTableSelectColumn(options: NormalizedTableColumn): WriterFunction {
  const {
    type,
    name,
    title,
    hasFilter,
  } = options;
  const properties: Record<string, string | WriterFunction> = {};
  properties['label'] = `$localize\`${ title ?? capitalize(name) }\``;
  if (hasFilter) {
    properties['filter'] = 'true';
  }
  properties['type'] = (w) => w.quote(type);
  return Writers.object(properties);
}

export function TableColumnListToTableSelectColumnMap(
  columnList: Array<NormalizedTableColumn>,
): WriterFunction {
  return Writers.object(
    columnList.reduce(
      (properties, column) => ({
        ...properties,
        [column.name]: TableColumnToTableSelectColumn(column),
      }),
      {},
    ),
  );
}

function printOptions(options: NormalizedTableSelectFormControlOptions) {
  PrintAngularOptions('table-select-form-control', options);
}

export default function (options: TableSelectFormControlOptions) {
  const normalizedOptions = NormalizeTableSelectFormControlOptions(options);
  const {
    name,
    project,
    feature,
    directory,
    formName,
    type,
    isArray,
    state,
    isRequired,
    validatorList,
    nestModule,
    controllerName,
    columnList,
    shared,
    context,
    scope,
  } = normalizedOptions;
  printOptions(normalizedOptions);

  const optionsOperationName = [ 'get', name, 'option', 'page' ].join('-');
  const optionsOperationPath = [ 'options', name, 'page' ].join('/');
  const optionsOperationId = buildOperationId(
    normalizedOptions,
    optionsOperationName,
    BuildNestControllerName({
      controllerName,
      nestModule,
    }),
  );

  const resolveValueOperationName = [ 'resolve', name, 'option', 'value' ].join(
    '-',
  );
  const resolveValueOperationPath = [ 'options', name, 'resolve', ':value' ].join(
    '/',
  );
  const resolveValueOperationId = buildOperationId(
    normalizedOptions,
    resolveValueOperationName,
    BuildNestControllerName({
      controllerName,
      nestModule,
    }),
  );

  const tableDataSourceName = classify(
    [ name, 'select-table', 'data-source' ].join('-'),
  );
  const tableDataSourceImportPath = `./data-sources/${ dasherize(
    name,
  ) }-select-table.data-source`;
  const tableDataSourceDirectory = join(directory ?? '', 'data-sources');

  const resolveValueMethodName = classify(
    [ dasherize(name), 'table-select', 'value', 'resolver', 'method' ].join('-'),
  );
  const resolveValueMethodImportPath = `./methods/${ dasherize(
    name,
  ) }-table-select-value-resolver.method`;
  const resolveValueMethodDirectory = join(directory ?? '', 'methods');

  const tableResponseDtoName = joinWithDash([ context, name, 'table-select' ]);

  return () => {
    return chain([
      () => console.group('\x1b[32m[@rxap/schematics-angular:table-select-form-control]\x1b[0m'),
      ExecuteSchematic('form-control', normalizedOptions),
      CoerceTableSelectOperationRule({
        project,
        feature,
        nestModule,
        controllerName,
        columnList: columnList.map(TableColumnToGetPageOperationColumn),
        operationName: optionsOperationName,
        path: optionsOperationPath,
        skipCoerceTableSuffix: true,
        responseDtoName: tableResponseDtoName,
        context,
      }),
      CoerceTableSelectValueResolveOperationRule({
        project,
        feature,
        nestModule,
        controllerName,
        operationName: resolveValueOperationName,
        path: resolveValueOperationPath,
        responseDtoName: tableResponseDtoName,
        context,
      }),
      CoerceFormProviderRule({
        project,
        feature,
        directory,
        providerObject: tableDataSourceName,
        importStructures: [
          {
            namedImports: [ tableDataSourceName ],
            moduleSpecifier: tableDataSourceImportPath,
          },
        ],
      }),
      CoerceFormProviderRule({
        project,
        feature,
        directory,
        providerObject: resolveValueMethodName,
        importStructures: [
          {
            namedImports: [ resolveValueMethodName ],
            moduleSpecifier: resolveValueMethodImportPath,
          },
        ],
      }),
      CoerceTableDataSourceRule({
        scope,
        project,
        feature,
        directory: tableDataSourceDirectory,
        shared,
        name: [ name, 'select-table' ].join('-'),
        operationId: optionsOperationId,
      }),
      CoerceTableSelectResolveValueMethodRule({
        scope,
        project,
        feature,
        directory: resolveValueMethodDirectory,
        shared,
        name: [ name, 'table-select', 'value', 'resolver' ].join('-'),
        operationId: resolveValueOperationId,
      }),
      CoerceFormDefinitionControl({
        project,
        feature,
        directory,
        formName,
        name,
        type,
        isArray,
        state,
        isRequired,
        validatorList,
        coerceFormControl: (
          sourceFile: SourceFile,
          classDeclaration: ClassDeclaration,
          control: Required<FormDefinitionControl>,
        ) => {
          const {
            propertyDeclaration,
            decoratorDeclaration,
          } =
            CoerceFormControl(sourceFile, classDeclaration, control);

          CoerceDecorator(propertyDeclaration, 'UseTableSelectDataSource').set({
            arguments: [ tableDataSourceName ],
          });
          CoerceImports(sourceFile, {
            namedImports: [ tableDataSourceName ],
            moduleSpecifier: tableDataSourceImportPath,
          });
          CoerceDecorator(propertyDeclaration, 'UseTableSelectMethod').set({
            arguments: [ resolveValueMethodName ],
          });
          CoerceImports(sourceFile, {
            namedImports: [ resolveValueMethodName ],
            moduleSpecifier: resolveValueMethodImportPath,
          });
          CoerceDecorator(propertyDeclaration, 'UseTableSelectColumns').set({
            arguments: [ TableColumnListToTableSelectColumnMap(columnList) ],
          });
          CoerceImports(sourceFile, {
            namedImports: [
              'UseTableSelectDataSource',
              'UseTableSelectColumns',
              'UseTableSelectMethod',
            ],
            moduleSpecifier: '@rxap/ngx-material-table-select',
          });

          return {
            propertyDeclaration,
            decoratorDeclaration,
          };
        },
      }),
      EnforceUseFormControlOrderRule(normalizedOptions),
      () => console.groupEnd(),
    ]);
  };
}
