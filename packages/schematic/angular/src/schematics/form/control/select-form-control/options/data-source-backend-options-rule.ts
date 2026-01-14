import {
  chain,
  Rule,
  SchematicsException,
} from '@angular-devkit/schematics';
import { IsNormalizedImportDataSourceOptions } from '@rxap/schematic-angular';
import {
  AbstractControl,
  CoerceFormControl,
  CoerceFormDefinitionControl,
  CoerceFormProviderRule,
} from '@rxap/schematics-ts-morph';
import {
  CoerceDecorator,
  CoerceImports,
} from '@rxap/ts-morph';
import {
  ClassDeclaration,
  SourceFile,
} from 'ts-morph';
import { NormalizedSelectFormControlOptions } from '../normalize-select-form-control-options';

export function dataSourceBackendOptionsRule(normalizedOptions: NormalizedSelectFormControlOptions): Rule {
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
    role,
    isOptional,
    source,
    dataSource,
  } = normalizedOptions;

  if (!dataSource) {
    throw new SchematicsException('The data source is required for the data source backend options rule!');
  }

  if (!IsNormalizedImportDataSourceOptions(dataSource)) {
    throw new SchematicsException('The data source must be an import data source!');
  }

  const optionsDataSourceName = dataSource.import.name;
  const optionsDataSourceImportPath = dataSource.import.moduleSpecifier;

  if (!optionsDataSourceName || !optionsDataSourceImportPath) {
    throw new SchematicsException(
      'The data source name and import path are required for the data source backend options rule!');
  }

  return chain([
    CoerceFormProviderRule({
      project,
      feature,
      directory,
      providerObject: optionsDataSourceName,
      importStructures: [
        {
          namedImports: [ optionsDataSourceName ],
          moduleSpecifier: optionsDataSourceImportPath,
        },
      ],
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
        } = CoerceFormControl(sourceFile, classDeclaration, formTypeName, control);

        CoerceDecorator(propertyDeclaration, 'UseOptionsDataSource').set({
          arguments: [ optionsDataSourceName ],
        });
        CoerceImports(sourceFile, {
          namedImports: [ optionsDataSourceName ],
          moduleSpecifier: optionsDataSourceImportPath,
        });
        CoerceImports(sourceFile, {
          namedImports: [ 'UseOptionsDataSource' ],
          moduleSpecifier: '@rxap/form-system',
        });

        return {
          propertyDeclaration,
          decoratorDeclaration,
        };

      },
    }),
  ]);
}