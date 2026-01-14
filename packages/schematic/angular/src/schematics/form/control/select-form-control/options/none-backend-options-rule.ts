import {
  chain,
  Rule,
} from '@angular-devkit/schematics';
import {
  AbstractControl,
  CoerceFormControl,
  CoerceFormDefinitionControl,
  CoerceFormProviderRule,
  CoerceOptionsDataSourceRule,
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
import { NormalizedSelectFormControlOptions } from '../normalize-select-form-control-options';

export function noneBackendOptionsRule(normalizedOptions: NormalizedSelectFormControlOptions): Rule {
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
    optionList,
  } = normalizedOptions;
  const optionsDataSourceDirectory = join(directory ?? '', 'data-sources');
  const optionsDataSourceName = classify(
    [ dasherize(name), 'options', 'data-source' ].join('-'),
  );
  const optionsDataSourceImportPath = `./data-sources/${ dasherize(
    name,
  ) }-options.data-source`;
  return chain([
    CoerceOptionsDataSourceRule({
      project,
      feature,
      optionList: optionList ?? [],
      directory: optionsDataSourceDirectory,
      name: [ dasherize(name), 'options' ].join('-'),
    }),
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