import {
  chain,
  Rule,
  SchematicsException,
} from '@angular-devkit/schematics';
import {
  AbstractControl,
  BuildNestControllerName,
  buildOperationId,
  CoerceDecorator,
  CoerceFormControl,
  CoerceFormDefinitionControl,
  CoerceFormProviderRule,
  CoerceImports,
  CoerceOptionsDataSourceRule,
  CoerceOptionsOperationRule,
  EnforceUseFormControlOrderRule,
  OperationIdToClassImportPath,
  OperationIdToClassName,
} from '@rxap/schematics-ts-morph';
import {
  classify,
  dasherize,
} from '@rxap/schematics-utilities';
import { Normalized } from '@rxap/utilities';
import { join } from 'path';
import {
  ClassDeclaration,
  SourceFile,
} from 'ts-morph';
import { PrintAngularOptions } from '../../../../lib/angular-options';
import { BackendTypes } from '../../../../lib/backend-types';
import {
  NormalizedSelectFormControl,
  NormalizeSelectFormControl,
} from '../../../../lib/form/control/select-form-control';
import {
  NormalizedFormControlOptions,
  NormalizeFormControlOptions,
} from '../../form-control';
import { SelectFormControlOptions } from './schema';

export type NormalizedSelectFormControlOptions = Readonly<Normalized<Omit<SelectFormControlOptions, 'optionList'>>>
  & NormalizedFormControlOptions & NormalizedSelectFormControl;

export function NormalizeSelectFormControlOptions(
  options: SelectFormControlOptions,
): NormalizedSelectFormControlOptions {
  return Object.freeze({
    ...NormalizeFormControlOptions(options),
    ...NormalizeSelectFormControl(options),
  });
}

function printOptions(options: NormalizedSelectFormControlOptions) {
  PrintAngularOptions('select-form-control', options);
}

function noneBackendOptionsRule(normalizedOptions: NormalizedSelectFormControlOptions): Rule {
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
    })
  ]);
}

function nestJsBackendOptionsRule(normalizedOptions: NormalizedSelectFormControlOptions): Rule {
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
    context,
    scope,
    overwrite,
    role,
    isOptional,
    source,
    upstream,
  } = normalizedOptions;
  const optionsOperationPath = [ 'control', dasherize(name), 'options' ].join('/');
  const optionsOperationName = [ 'get', dasherize(name), 'control', 'options' ].join('-');
  const optionsOperationId = buildOperationId(
    normalizedOptions,
    optionsOperationName,
    BuildNestControllerName({
      controllerName,
      nestModule,
    }),
  );
  return chain([
    CoerceOptionsOperationRule({
      project,
      feature,
      nestModule,
      controllerName,
      overwrite,
      operationName: optionsOperationName,
      path: optionsOperationPath,
      control: normalizedOptions,
      context,
      upstream,
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
        formTypeName,
        control: AbstractControl,
      ) => {
        const {
          propertyDeclaration,
          decoratorDeclaration,
        } = CoerceFormControl(sourceFile, classDeclaration, formTypeName, control);

        CoerceDecorator(propertyDeclaration, 'UseOptionsMethod').set({
          arguments: [
            OperationIdToClassName(optionsOperationId),
          ],
        });
        CoerceImports(sourceFile, {
          namedImports: [ OperationIdToClassName(optionsOperationId) ],
          moduleSpecifier: OperationIdToClassImportPath(optionsOperationId, scope),
        });
        CoerceImports(sourceFile, {
          namedImports: [ 'UseOptionsMethod' ],
          moduleSpecifier: '@rxap/form-system',
        });

        return {
          propertyDeclaration,
          decoratorDeclaration,
        };

      },
    })
  ]);
}

function openApiBackendOptionsRule(normalizedOptions: NormalizedSelectFormControlOptions): Rule {
  return () => {
    throw new SchematicsException('The open api backend is not supported yet!');
  };
}

function optionsRule(normalizedOptions: NormalizedSelectFormControlOptions): Rule {
  const { backend } = normalizedOptions;
  switch (backend) {
    case BackendTypes.LOCAL:
    case BackendTypes.NONE:
      return noneBackendOptionsRule(normalizedOptions);
    case BackendTypes.NESTJS:
      return nestJsBackendOptionsRule(normalizedOptions);
    case BackendTypes.OPEN_API:
      return openApiBackendOptionsRule(normalizedOptions);
    default:
      throw new SchematicsException(`The backend type "${ backend }" is not supported!`);
  }
}

export default function (options: SelectFormControlOptions) {
  const normalizedOptions = NormalizeSelectFormControlOptions(options);
  printOptions(normalizedOptions);
  return () => {
    return chain([
      () => console.group('[@rxap/schematics-angular:select-form-control]'.green),
      optionsRule(normalizedOptions),
      EnforceUseFormControlOrderRule(normalizedOptions),
      () => console.groupEnd(),
    ]);
  };
}
