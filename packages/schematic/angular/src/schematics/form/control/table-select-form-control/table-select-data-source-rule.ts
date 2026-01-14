import { chain } from '@angular-devkit/schematics';
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
  OperationIdToResponseClassImportPath,
  OperationIdToResponseClassName,
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
    overwrite,
    identifier,
    source,
    backend,
  } = normalizedOptions;

  const optionsOperationName = buildOptionsOperationName(normalizedOptions);
  const optionsOperationPath = buildOptionsOperationPath(normalizedOptions);
  const optionsOperationId = buildOptionsOperationId(normalizedOptions);

  const tableDataSourceName = classify(
    [ dasherize(name), 'select-table', 'data-source' ].join('-'),
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
      overwrite,
      propertyList,
      operationName: optionsOperationName,
      path: optionsOperationPath,
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
      directory: tableDataSourceDirectory,
      shared,
      name: [ dasherize(name), 'select-table' ].join('-'),
      operationId: optionsOperationId,
    }),
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

        const tableSelectOperationResponseClassName = OperationIdToResponseClassName(optionsOperationId);

        CoerceImports(sourceFile, {
          namedImports: [ tableSelectOperationResponseClassName ],
          moduleSpecifier: OperationIdToResponseClassImportPath(optionsOperationId),
        });

        CoerceDecorator(propertyDeclaration, 'UseTableSelectDataSource').set({
          arguments: [ tableDataSourceName ],
        });
        CoerceDecorator(
          propertyDeclaration,
          `UseTableSelectToDisplay<${ tableSelectOperationResponseClassName }['rows'][number]>`,
        ).set({
          arguments: [ `item => item.${ toDisplay.property.name }` ],
        });
        CoerceDecorator(
          propertyDeclaration, `UseTableSelectToValue<${ tableSelectOperationResponseClassName }['rows'][number]>`).set(
          {
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
  ]);

}