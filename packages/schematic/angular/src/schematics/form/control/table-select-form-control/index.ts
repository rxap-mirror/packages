import { chain } from '@angular-devkit/schematics';
import {
  BuildNestControllerName,
  buildOperationId,
  CoerceFormControl,
  CoerceFormDefinitionControl,
  CoerceFormProviderRule,
  CoerceTableDataSourceRule,
  CoerceTableSelectOperationRule,
  EnforceUseFormControlOrderRule,
  FormDefinitionControl,
} from '@rxap/schematics-ts-morph';
import {
  capitalize,
  classify,
  dasherize,
} from '@rxap/schematics-utilities';
import {
  CoerceDecorator,
  CoerceImports,
  OperationIdToResponseClassImportPath,
  OperationIdToResponseClassName,
} from '@rxap/ts-morph';
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
  NormalizedTableSelectColumn,
  NormalizedTableSelectFormControl,
  NormalizeTableSelectFormControl,
} from '../../../../lib/form-control';
import { TableColumnListAndPropertyListToGetPageOperationPropertyList } from '../../../table/table-component';
import {
  NormalizedFormControlOptions,
  NormalizeFormControlOptions,
} from '../../form-control';
import { TableSelectFormControlOptions } from './schema';

export interface NormalizedTableSelectFormControlOptions
  extends Readonly<Normalized<Omit<TableSelectFormControlOptions, 'columnList' | 'propertyList'>> & NormalizedFormControlOptions & NormalizedTableSelectFormControl> {
  controllerName: string;
}

export function NormalizeTableSelectFormControlOptions(
  options: TableSelectFormControlOptions,
): NormalizedTableSelectFormControlOptions {
  const normalizedOptions = NormalizeFormControlOptions(options);
  return Object.freeze({
    ...normalizedOptions,
    ...NormalizeTableSelectFormControl(options),
    controllerName: BuildNestControllerName(normalizedOptions),
  });
}

export function TableColumnToTableSelectColumn(column: NormalizedTableSelectColumn): WriterFunction {
  const {
    kind,
    name,
    title,
    hasFilter,
  } = column;
  const properties: Record<string, string | WriterFunction> = {};
  properties['label'] = `$localize\`${ title ?? capitalize(name) }\``;
  if (hasFilter) {
    properties['filter'] = 'true';
  }
  properties['type'] = (w) => w.quote(kind);
  return Writers.object(properties);
}

export function TableColumnListToTableSelectColumnMap(
  columnList: Array<NormalizedTableSelectColumn>,
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

function buildOptionsOperationName({ name }: { name: string }) {
  return [ 'get', name, 'control', 'table-select', 'page' ].join('-');
}

function buildOptionsOperationPath({ name }: { name: string }) {
  return [ 'control', name, 'table-select', 'page' ].join('/');
}

function buildOptionsOperationId(normalizedOptions: NormalizedTableSelectFormControlOptions) {
  return buildOperationId(
    normalizedOptions,
    buildOptionsOperationName(normalizedOptions),
    BuildNestControllerName(normalizedOptions),
  );
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
    toDisplay,
    toValue,
    propertyList,
    upstream,
  } = normalizedOptions;
  printOptions(normalizedOptions);

  const optionsOperationName = buildOptionsOperationName(normalizedOptions);
  const optionsOperationPath = buildOptionsOperationPath(normalizedOptions);
  const optionsOperationId = buildOptionsOperationId(normalizedOptions);

  // const resolveValueOperationName = [ 'resolve', name, 'option', 'value' ].join(
  //   '-',
  // );
  // const resolveValueOperationPath = [ 'options', name, 'resolve', ':value' ].join(
  //   '/',
  // );
  // const resolveValueOperationId = buildOperationId(
  //   normalizedOptions,
  //   resolveValueOperationName,
  //   BuildNestControllerName({
  //     controllerName,
  //     nestModule,
  //   }),
  // );

  const tableDataSourceName = classify(
    [ name, 'select-table', 'data-source' ].join('-'),
  );
  const tableDataSourceImportPath = `./data-sources/${ dasherize(
    name,
  ) }-select-table.data-source`;
  const tableDataSourceDirectory = join(directory ?? '', 'data-sources');

  // const resolveValueMethodName = classify(
  //   [ dasherize(name), 'table-select', 'value', 'resolver', 'method' ].join('-'),
  // );
  // const resolveValueMethodImportPath = `./methods/${ dasherize(
  //   name,
  // ) }-table-select-value-resolver.method`;
  // const resolveValueMethodDirectory = join(directory ?? '', 'methods');

  const tableResponseDtoName = joinWithDash([ context, name, 'table-select' ]);

  return () => {
    return chain([
      () => console.group('\x1b[32m[@rxap/schematics-angular:table-select-form-control]\x1b[0m'),
      CoerceTableSelectOperationRule({
        project,
        feature,
        nestModule,
        controllerName,
        propertyList: TableColumnListAndPropertyListToGetPageOperationPropertyList(columnList, propertyList),
        operationName: optionsOperationName,
        path: optionsOperationPath,
        dtoClassNameSuffix: tableResponseDtoName,
        context,
        upstream
      }),
      // CoerceTableSelectValueResolveOperationRule({
      //   project,
      //   feature,
      //   nestModule,
      //   controllerName,
      //   operationName: resolveValueOperationName,
      //   path: resolveValueOperationPath,
      //   responseDtoName: tableResponseDtoName,
      //   context,
      // }),
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
      // CoerceFormProviderRule({
      //   project,
      //   feature,
      //   directory,
      //   providerObject: resolveValueMethodName,
      //   importStructures: [
      //     {
      //       namedImports: [ resolveValueMethodName ],
      //       moduleSpecifier: resolveValueMethodImportPath,
      //     },
      //   ],
      // }),
      CoerceTableDataSourceRule({
        scope,
        project,
        feature,
        directory: tableDataSourceDirectory,
        shared,
        name: [ name, 'select-table' ].join('-'),
        operationId: optionsOperationId,
      }),
      // CoerceTableSelectResolveValueMethodRule({
      //   scope,
      //   project,
      //   feature,
      //   directory: resolveValueMethodDirectory,
      //   shared,
      //   name: [ name, 'table-select', 'value', 'resolver' ].join('-'),
      //   operationId: resolveValueOperationId,
      // }),
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

          const tableSelectOperationResponseClassName = OperationIdToResponseClassName(optionsOperationId);

          CoerceImports(sourceFile, {
            namedImports: [ tableSelectOperationResponseClassName ],
            moduleSpecifier: OperationIdToResponseClassImportPath(optionsOperationId),
          });

          CoerceDecorator(propertyDeclaration, 'UseTableSelectDataSource').set({
            arguments: [ tableDataSourceName ],
          });
          CoerceDecorator(propertyDeclaration, `UseTableSelectToDisplay<${tableSelectOperationResponseClassName}['rows'][number]>`).set({
            arguments: [ `item => item.${ toDisplay.property.name }` ],
          });
          CoerceDecorator(propertyDeclaration, `UseTableSelectToValue<${tableSelectOperationResponseClassName}['rows'][number]>`).set({
            arguments: [ `item => item.${ toValue.property.name }` ],
          });
          CoerceImports(sourceFile, {
            namedImports: [ tableDataSourceName ],
            moduleSpecifier: tableDataSourceImportPath,
          });
          // CoerceDecorator(propertyDeclaration, 'UseTableSelectMethod').set({
          //   arguments: [ resolveValueMethodName ],
          // });
          // CoerceImports(sourceFile, {
          //   namedImports: [ resolveValueMethodName ],
          //   moduleSpecifier: resolveValueMethodImportPath,
          // });
          CoerceDecorator(propertyDeclaration, 'UseTableSelectColumns').set({
            arguments: [ TableColumnListToTableSelectColumnMap(columnList) ],
          });
          CoerceImports(sourceFile, {
            namedImports: [
              'UseTableSelectDataSource',
              'UseTableSelectColumns',
              // 'UseTableSelectMethod',
              'UseTableSelectToDisplay',
              'UseTableSelectToValue'
            ],
            moduleSpecifier: '@digitaix/eurogard-table-select',
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
