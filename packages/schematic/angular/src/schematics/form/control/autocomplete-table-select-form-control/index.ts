import {
  chain,
  Rule,
} from '@angular-devkit/schematics';
import {
  AbstractControl,
  BuildNestControllerName,
  buildOperationId,
  CoerceAutocompleteOptionsOperationRule,
  CoerceAutocompleteTableSelectValueResolveOperationRule,
  CoerceFormControl,
  CoerceFormDefinitionControl,
  CoerceFormProviderRule,
  CoerceTableDataSourceRule,
  CoerceTableSelectOperationRule,
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
  OperationIdToClassRemoteMethodImportPath,
  OperationIdToRemoteMethodClassName,
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
import { BackendTypes } from '../../../../lib/backend-types';
import { DataSourceKinds } from '../../../../lib/data-source/data-source-kinds';
import { AssertIsNormalizedImportDataSourceOptions } from '../../../../lib/data-source/data-source-options';
import {
  NormalizedTableSelectColumn,
  NormalizedTableSelectFormControl,
  NormalizeTableSelectFormControl,
  TableSelectFormControl,
} from '../../../../lib/form/control/table-select-form-control';
import { MethodKinds } from '../../../../lib/method/method-kinds';
import {
  AssertIsNormalizedImportMethodOptions,
  AssertIsNormalizedOpenApiMethodOptions,
} from '../../../../lib/method/method-options';
import {
  NormalizedFormControlOptions,
  NormalizeFormControlOptions,
} from '../../form-control';
import { FormControlOptions } from '../../form-control/schema';
import { AutocompleteTableSelectFormControlOptions } from './schema';

export type NormalizedTableSelectFormControlOptions = NonNullableSelected<Readonly<Normalized<Omit<AutocompleteTableSelectFormControlOptions, keyof FormControlOptions | keyof TableSelectFormControl>>> & NormalizedFormControlOptions & NormalizedTableSelectFormControl, 'controllerName'>

export function NormalizeTableSelectFormControlOptions(
  options: AutocompleteTableSelectFormControlOptions,
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
  PrintAngularOptions('autocomplete-table-select-form-control', options);
}

function buildOptionsOperationName({ name }: { name: string }) {
  return [ 'get', dasherize(name), 'control', 'table-select', 'page' ].join('-');
}

function buildOptionsOperationPath({ name }: { name: string }) {
  return [ 'control', dasherize(name), 'table-select', 'page' ].join('/');
}

function buildOptionsOperationId(normalizedOptions: NormalizedTableSelectFormControlOptions) {
  return buildOperationId(
    normalizedOptions,
    buildOptionsOperationName(normalizedOptions),
    BuildNestControllerName(normalizedOptions),
  );
}

function buildDtoSuffix({ context, name }: NormalizedTableSelectFormControlOptions) {
  return joinWithDash([ context, dasherize(name), 'table-select' ]);
}

function autocompleteTableSelectResolveRule(normalizedOptions: NormalizedTableSelectFormControlOptions) {

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
    toValue,
    role,
    isOptional,
    overwrite,
    identifier,
    backend,
    source,
  } = normalizedOptions;
  const { upstream, method } = resolver ?? {};

  const rules: Rule[] = [];

  let autocompleteResolveMethod: string | null = null;
  let autocompleteResolveMethodModuleSpecifier: string | null = null;

  if (method) {
    switch (method.kind) {
      case MethodKinds.OPEN_API:
        AssertIsNormalizedOpenApiMethodOptions(method);
        autocompleteResolveMethod = OperationIdToRemoteMethodClassName(method.operationId);
        autocompleteResolveMethodModuleSpecifier = OperationIdToClassRemoteMethodImportPath(method.operationId, scope);
        break;
      case MethodKinds.IMPORT:
        AssertIsNormalizedImportMethodOptions(method);
        autocompleteResolveMethod = method.import.name;
        autocompleteResolveMethodModuleSpecifier = method.import.moduleSpecifier;
        if (!autocompleteResolveMethodModuleSpecifier) {
          throw new Error('The import module specifier is required for a autocomplete table select control resolver!');
        }
        rules.push(CoerceFormProviderRule({
          project,
          feature,
          directory,
          providerObject: autocompleteResolveMethod,
          importStructures: [
            {
              namedImports: [ autocompleteResolveMethod ],
              moduleSpecifier: autocompleteResolveMethodModuleSpecifier,
            },
          ],
        }));
        break;
      default:
        throw new Error(`The method kind ${ method.kind } is not supported for a autocomplete table select control resolver!`);
    }
  } else {
    switch (backend.kind) {
      case BackendTypes.NESTJS:
        // eslint-disable-next-line no-case-declarations
        const resolveValueOperationName = [ 'resolve', dasherize(name), 'control', 'value' ].join(
          '-',
        );
        // eslint-disable-next-line no-case-declarations
        const resolveValueOperationId = buildOperationId(
          normalizedOptions,
          resolveValueOperationName,
          BuildNestControllerName({
            controllerName,
            nestModule,
          }),
        );
        autocompleteResolveMethod = OperationIdToRemoteMethodClassName(resolveValueOperationId);
        autocompleteResolveMethodModuleSpecifier = OperationIdToClassRemoteMethodImportPath(resolveValueOperationId, scope);
        rules.push(
          CoerceAutocompleteTableSelectValueResolveOperationRule({
            project,
            feature,
            nestModule,
            controllerName,
            upstream,
            overwrite,
            propertyList: propertyList.slice(),
            rowValueProperty: toValue.property,
            rowDisplayProperty: toDisplay.property,
            operationName: resolveValueOperationName,
            path: [ 'control', dasherize(name), 'resolve', ':value' ].join('/'),
            dtoClassNameSuffix: joinWithDash([ context, dasherize(name), 'control', 'options' ]),
            context,
            backend,
          }),
        );
        break;
      default:
        throw new Error(`The backend kind ${ backend.kind } is not supported for a autocomplete table select control resolver!`);
    }
  }

  if (!autocompleteResolveMethod || !autocompleteResolveMethodModuleSpecifier) {
    throw new Error('The backend kind is not nestjs and a resolver method is not provided!');
  }

  rules.push(
    CoerceFormDefinitionControl({
      role,
      isOptional,
      source,
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
        formTypeName: string,
        control: AbstractControl,
      ) => {
        const {
          propertyDeclaration,
          decoratorDeclaration,
        } =
          CoerceFormControl(sourceFile, classDeclaration, formTypeName, control);

        CoerceDecorator(propertyDeclaration, 'UseResolveMethod', {
          arguments: [
            autocompleteResolveMethod,
          ],
        });
        CoerceImports(sourceFile, {
          namedImports: [ autocompleteResolveMethod ],
          moduleSpecifier: autocompleteResolveMethodModuleSpecifier
        });
        CoerceImports(sourceFile, {
          namedImports: [
            'UseResolveMethod',
          ],
          moduleSpecifier: '@rxap/form-system',
        });

        return {
          propertyDeclaration,
          decoratorDeclaration,
        };
      },
    }),
  );

  return chain(rules);
}

function autocompleteTableSelectOptionsRule(normalizedOptions: NormalizedTableSelectFormControlOptions) {

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
    upstream,
    propertyList,
    toDisplay,
    toValue,
    role,
    isOptional,
    identifier,
    overwrite,
    source,
    backend,
    options,
  } = normalizedOptions;
  const { method } = options ?? {};

  const rules: Rule[] = [];

  let autocompleteOptionsMethod: string | null = null;
  let autocompleteOptionsMethodModuleSpecifier: string | null = null;

  if (method) {
    switch (method.kind) {
      case MethodKinds.OPEN_API:
        AssertIsNormalizedOpenApiMethodOptions(method);
        autocompleteOptionsMethod = OperationIdToRemoteMethodClassName(method.operationId);
        autocompleteOptionsMethodModuleSpecifier = OperationIdToClassRemoteMethodImportPath(method.operationId, scope);
        break;
      case MethodKinds.IMPORT:
        AssertIsNormalizedImportMethodOptions(method);
        autocompleteOptionsMethod = method.import.name;
        autocompleteOptionsMethodModuleSpecifier = method.import.moduleSpecifier;
        if (!autocompleteOptionsMethodModuleSpecifier) {
          throw new Error('The import module specifier is required for a autocomplete table select control resolver!');
        }
        rules.push(CoerceFormProviderRule({
          project,
          feature,
          directory,
          providerObject: autocompleteOptionsMethod,
          importStructures: [
            {
              namedImports: [ autocompleteOptionsMethod ],
              moduleSpecifier: autocompleteOptionsMethodModuleSpecifier,
            },
          ],
        }));
        break;
      default:
        throw new Error(`The method kind ${ method.kind } is not supported for a autocomplete table select control options!`);
    }
  } else {
    switch (backend.kind) {
      case BackendTypes.NESTJS:
        // eslint-disable-next-line no-case-declarations
        const optionsOperationName = [ 'get', dasherize(name), 'control', 'options' ].join(
          '-',
        );
        // eslint-disable-next-line no-case-declarations
        const optionsOperationId = buildOperationId(
          normalizedOptions,
          optionsOperationName,
          BuildNestControllerName({
            controllerName,
            nestModule,
          }),
        );
        autocompleteOptionsMethod = OperationIdToRemoteMethodClassName(optionsOperationId);
        autocompleteOptionsMethodModuleSpecifier = OperationIdToClassRemoteMethodImportPath(optionsOperationId, scope);
        rules.push(
          CoerceAutocompleteOptionsOperationRule({
            project,
            feature,
            nestModule,
            controllerName,
            upstream,
            overwrite,
            propertyList: propertyList.slice(),
            toValueProperty: toValue.property,
            toDisplayProperty: toDisplay.property,
            operationName: optionsOperationName,
            path: [ 'control', dasherize(name), 'options' ].join('/'),
            dtoClassNameSuffix: joinWithDash([ context, dasherize(name), 'control', 'options' ]),
            context,
            backend,
          }),
        );
        break;
      default:
        throw new Error(`The backend kind ${ backend.kind } is not supported for a autocomplete table select control options!`);
    }
  }

  if (!autocompleteOptionsMethod || !autocompleteOptionsMethodModuleSpecifier) {
    throw new Error('The backend kind is not nestjs and a options method is not provided!');
  }

  rules.push(
    CoerceFormDefinitionControl({
      role,
      isOptional,
      source,
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
        formTypeName: string,
        control: AbstractControl,
      ) => {
        const {
          propertyDeclaration,
          decoratorDeclaration,
        } =
          CoerceFormControl(sourceFile, classDeclaration, formTypeName, control);

        CoerceDecorator(propertyDeclaration, 'UseAutocompleteOptionsMethod', {
          arguments: [
            autocompleteOptionsMethod,
          ],
        });
        CoerceImports(sourceFile, {
          namedImports: [ autocompleteOptionsMethod ],
          moduleSpecifier: autocompleteOptionsMethodModuleSpecifier,
        });
        CoerceImports(sourceFile, {
          namedImports: [
            'UseAutocompleteOptionsMethod',
          ],
          moduleSpecifier: 'autocomplete-table-select',
        });

        return {
          propertyDeclaration,
          decoratorDeclaration,
        };
      },
    }),
  );


  return chain(rules);
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
    role,
    isOptional,
    identifier,
    overwrite,
    source,
    backend,
    dataSource,
  } = normalizedOptions;

  const rules: Rule[] = [];

  let tableDataSourceName: string | null = null;
  let tableDataSourceImportPath: string | null = null;

  if (dataSource) {
    switch (dataSource.kind) {
      case DataSourceKinds.IMPORT:
        AssertIsNormalizedImportDataSourceOptions(dataSource);
        tableDataSourceName = dataSource.import.name;
        tableDataSourceImportPath = dataSource.import.moduleSpecifier;
        if (!tableDataSourceImportPath) {
          throw new Error('The import module specifier is required for a autocomplete table select control resolver!');
        }
        rules.push(CoerceFormProviderRule({
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
        }));
        break;
      default:
        throw new Error(`The data source kind ${ dataSource.kind } is not supported for a autocomplete table select control data source!`);
    }
  } else {
    switch (backend.kind) {
      case BackendTypes.NESTJS:
        tableDataSourceName = classify(
          [ dasherize(name), 'select-table', 'data-source' ].join('-'),
        );
        tableDataSourceImportPath = `./data-sources/${ dasherize(
          name,
        ) }-select-table.data-source`;
        rules.push(
          CoerceTableSelectOperationRule({
            project,
            feature,
            nestModule,
            controllerName,
            overwrite,
            propertyList: propertyList.slice(),
            operationName: buildOptionsOperationName(normalizedOptions),
            path: buildOptionsOperationPath(normalizedOptions),
            dtoClassNameSuffix: buildDtoSuffix(normalizedOptions),
            rowValueProperty: toValue.property,
            rowDisplayProperty: toDisplay.property,
            idProperty: identifier.property,
            rowId: toValue.property,
            context,
            upstream,
            backend,
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
            directory: join(directory ?? '', 'data-sources'),
            shared,
            name: [ dasherize(name), 'select-table' ].join('-'),
            operationId: buildOptionsOperationId(normalizedOptions),
          }),
        );
        break;
      default:
        throw new Error(`The backend kind ${ backend.kind } is not supported for a autocomplete table select control data source!`);
    }
  }

  if (!tableDataSourceName || !tableDataSourceImportPath) {
    throw new Error('The backend kind is not nestjs and a data source is not provided!');
  }

  rules.push(
    CoerceFormDefinitionControl({
      role,
      isOptional,
      source,
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
        formTypeName: string,
        control: AbstractControl,
      ) => {
        const {
          propertyDeclaration,
          decoratorDeclaration,
        } =
          CoerceFormControl(sourceFile, classDeclaration, formTypeName, control);

        CoerceDecorator(propertyDeclaration, 'UseTableSelectDataSource', {
          arguments: [ tableDataSourceName ],
        });
        CoerceDecorator(propertyDeclaration, 'UseTableSelectColumns', {
          arguments: [ TableColumnListToTableSelectColumnMap(columnList) ],
        });
        CoerceImports(sourceFile, {
          namedImports: [ tableDataSourceName ],
          moduleSpecifier: tableDataSourceImportPath,
        });
        CoerceImports(sourceFile, {
          namedImports: [
            'UseTableSelectDataSource',
            'UseTableSelectColumns',
            'UseTableSelectToDisplay',
            'UseTableSelectToValue'
          ],
          moduleSpecifier: '@rxap/ngx-material-table-select',
        });

        return {
          propertyDeclaration,
          decoratorDeclaration,
        };
      },
    }),
  );

  return chain(rules);

}

export default function (options: AutocompleteTableSelectFormControlOptions) {
  const normalizedOptions = NormalizeTableSelectFormControlOptions(options);
  printOptions(normalizedOptions);

  return () => {
    return chain([
      () => console.group('[@rxap/schematics-angular:autocomplete-table-select-form-control]'.green),
      tableSelectDataSourceRule(normalizedOptions),
      autocompleteTableSelectResolveRule(normalizedOptions),
      autocompleteTableSelectOptionsRule(normalizedOptions),
      EnforceUseFormControlOrderRule(normalizedOptions),
      () => console.groupEnd(),
    ]);
  };
}
