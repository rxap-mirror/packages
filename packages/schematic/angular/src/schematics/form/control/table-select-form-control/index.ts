import { chain } from '@angular-devkit/schematics';
import {
  AbstractControl,
  BuildNestControllerName,
  buildOperationId,
  CoerceFormControl,
  CoerceFormDefinitionControl,
  CoerceFormProviderRule,
  CoerceTableDataSourceRule,
  CoerceTableSelectOperationRule,
  CoerceTableSelectResolveValueMethodRule,
  CoerceTableSelectValueResolveOperationRule,
  EnforceUseFormControlOrderRule,
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
  NonNullableSelected,
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
} from '../../../../lib/form/control/table-select-form-control';
import {
  NormalizedFormControlOptions,
  NormalizeFormControlOptions,
} from '../../form-control';
import { TableSelectFormControlOptions } from './schema';

export type NormalizedTableSelectFormControlOptions = NonNullableSelected<Readonly<Normalized<Omit<TableSelectFormControlOptions, 'columnList' | 'propertyList'>>> & NormalizedFormControlOptions & NormalizedTableSelectFormControl, 'controllerName'>

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

function buildDtoSuffix({ context, name }: NormalizedTableSelectFormControlOptions) {
  return joinWithDash([ context, name, 'table-select' ]);
}

function tableSelectResolveRule(normalizedOptions: NormalizedTableSelectFormControlOptions) {

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
    shared,
    context,
    scope,
    resolver,
    propertyList,
    toDisplay,
    toValue
  } = normalizedOptions;
  const { upstream } = resolver ?? {};

  const resolveValueOperationName = [ 'resolve', name, 'control', 'value' ].join(
    '-',
  );
  const resolveValueOperationPath = [ 'control', name, 'resolve', ':value' ].join(
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
  const resolveValueName = [ dasherize(name), 'table-select', 'value', 'resolver' ].join('-');
  const resolveValueMethodName = classify(
    [ resolveValueName, 'method' ].join('-'),
  );
  const resolveValueMethodImportPath = `./methods/${ resolveValueName }.method`;
  const resolveValueMethodDirectory = join(directory ?? '', 'methods');

  return chain([
    CoerceTableSelectValueResolveOperationRule({
      project,
      feature,
      nestModule,
      controllerName,
      upstream,
      propertyList,
      rowValueProperty: toValue.property.name,
      rowDisplayProperty: toDisplay.property.name,
      operationName: resolveValueOperationName,
      path: resolveValueOperationPath,
      dtoClassNameSuffix: buildDtoSuffix(normalizedOptions),
      context,
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
    CoerceTableSelectResolveValueMethodRule({
      scope,
      project,
      feature,
      directory: resolveValueMethodDirectory,
      shared,
      name: resolveValueName,
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
        control: Required<AbstractControl>,
      ) => {
        const {
          propertyDeclaration,
          decoratorDeclaration,
        } =
          CoerceFormControl(sourceFile, classDeclaration, control);

        CoerceDecorator(propertyDeclaration, 'UseTableSelectMethod').set({
          arguments: [ resolveValueMethodName ],
        });
        CoerceImports(sourceFile, {
          namedImports: [ resolveValueMethodName ],
          moduleSpecifier: resolveValueMethodImportPath,
        });
        CoerceImports(sourceFile, {
          namedImports: [
            'UseTableSelectMethod',
          ],
          moduleSpecifier: '@digitaix/eurogard-table-select',
        });

        return {
          propertyDeclaration,
          decoratorDeclaration,
        };
      },
    }),
  ]);
}

function tableSelectDataSourceRule(normalizedOptions: NormalizedTableSelectFormControlOptions) {

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

  const optionsOperationName = buildOptionsOperationName(normalizedOptions);
  const optionsOperationPath = buildOptionsOperationPath(normalizedOptions);
  const optionsOperationId = buildOptionsOperationId(normalizedOptions);

  const tableDataSourceName = classify(
    [ name, 'select-table', 'data-source' ].join('-'),
  );
  const tableDataSourceImportPath = `./data-sources/${ dasherize(
    name,
  ) }-select-table.data-source`;
  const tableDataSourceDirectory = join(directory ?? '', 'data-sources');

  return chain([
    CoerceTableSelectOperationRule({
      project,
      feature,
      nestModule,
      controllerName,
      propertyList,
      operationName: optionsOperationName,
      path: optionsOperationPath,
      dtoClassNameSuffix: buildDtoSuffix(normalizedOptions),
      rowValueProperty: toValue.property.name,
      rowDisplayProperty: toDisplay.property.name,
      context,
      upstream
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
    CoerceTableDataSourceRule({
      scope,
      project,
      feature,
      directory: tableDataSourceDirectory,
      shared,
      name: [ name, 'select-table' ].join('-'),
      operationId: optionsOperationId,
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
        control: Required<AbstractControl>,
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
        CoerceDecorator(propertyDeclaration, 'UseTableSelectColumns').set({
          arguments: [ TableColumnListToTableSelectColumnMap(columnList) ],
        });
        CoerceImports(sourceFile, {
          namedImports: [
            'UseTableSelectDataSource',
            'UseTableSelectColumns',
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
  ]);

}

export default function (options: TableSelectFormControlOptions) {
  const normalizedOptions = NormalizeTableSelectFormControlOptions(options);
  printOptions(normalizedOptions);

  return () => {
    return chain([
      () => console.group('\x1b[32m[@rxap/schematics-angular:table-select-form-control]\x1b[0m'),
      tableSelectDataSourceRule(normalizedOptions),
      tableSelectResolveRule(normalizedOptions),
      EnforceUseFormControlOrderRule(normalizedOptions),
      () => console.groupEnd(),
    ]);
  };
}
