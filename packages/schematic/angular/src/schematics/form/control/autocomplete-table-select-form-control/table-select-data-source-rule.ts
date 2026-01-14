import {
  chain,
  Rule,
} from '@angular-devkit/schematics';
import {
  AssertIsNormalizedImportDataSourceOptions,
  BackendTypes,
  DataSourceKinds,
} from '@rxap/schematic-angular';
import {
  AbstractControl,
  CoerceFormControl,
  CoerceFormDefinitionControl,
  CoerceFormProviderRule,
  CoerceTableDataSourceRule,
  CoerceTableSelectOperationRule,
} from '@rxap/schematics-ts-morph';
import {
  classify,
  dasherize,
} from '@rxap/schematics-utilities';
import {
  CoerceDecorator,
  CoerceImports,
} from '@rxap/ts-morph';
import { join } from 'path';
import {
  ClassDeclaration,
  SourceFile,
} from 'ts-morph';
import { buildDtoSuffix } from './build-dto-suffix';
import { buildOptionsOperationId } from './build-options-operation-id';
import { buildOptionsOperationName } from './build-options-operation-name';
import { buildOptionsOperationPath } from './build-options-operation-path';
import { NormalizedTableSelectFormControlOptions } from './normalize-table-select-form-control-options';
import { TableColumnListToTableSelectColumnMap } from './table-column-to-table-select-column';

export function tableSelectDataSourceRule(normalizedOptions: NormalizedTableSelectFormControlOptions) {

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
        throw new Error(
          `The data source kind ${ dataSource.kind } is not supported for a autocomplete table select control data source!`);
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
        throw new Error(
          `The backend kind ${ backend.kind } is not supported for a autocomplete table select control data source!`);
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
            'UseTableSelectToValue',
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