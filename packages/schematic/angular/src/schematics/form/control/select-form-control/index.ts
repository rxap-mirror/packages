import {
  chain,
  Rule,
  SchematicsException,
} from '@angular-devkit/schematics';
import {
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
  FormDefinitionControl,
  OperationIdToClassImportPath,
  OperationIdToClassName,
} from '@rxap/schematics-ts-morph';
import {
  classify,
  dasherize,
  ExecuteSchematic,
} from '@rxap/schematics-utilities';
import { Normalized } from '@rxap/utilities';
import { join } from 'path';
import {
  ClassDeclaration,
  SourceFile,
  Writers,
} from 'ts-morph';
import { PrintAngularOptions } from '../../../../lib/angular-options';
import { BackendTypes } from '../../../../lib/backend-types';
import {
  NormalizedSelectFormControl,
  NormalizeSelectFormControl,
} from '../../../../lib/form-control';
import {
  NormalizedFormControlOptions,
  NormalizeFormControlOptions,
} from '../../form-control';
import { SelectFormControlOptions } from './schema';

export type NormalizedSelectFormControlOptions = Readonly<Normalized<Omit<SelectFormControlOptions, 'options'>>>
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
  } = normalizedOptions;
  const optionsDataSourceDirectory = join(directory ?? '', 'data-sources');
  const optionsDataSourceName = classify(
    [ name, 'options', 'data-source' ].join('-'),
  );
  const optionsDataSourceImportPath = `./data-sources/${ dasherize(
    name,
  ) }-options.data-source`;
  return chain([
    CoerceOptionsDataSourceRule({
      project,
      feature,
      directory: optionsDataSourceDirectory,
      name: [ name, 'options' ].join('-'),
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
        } = CoerceFormControl(sourceFile, classDeclaration, control);

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
  } = normalizedOptions;
  const optionsOperationPath = [ 'options', name ].join('/');
  const optionsOperationName = [ 'get', name, 'options' ].join('-');
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
      operationName: optionsOperationName,
      path: optionsOperationPath,
      control: normalizedOptions,
      context,
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
        } = CoerceFormControl(sourceFile, classDeclaration, control);

        CoerceDecorator(propertyDeclaration, 'UseOptionsMethod').set({
          arguments: [
            OperationIdToClassName(optionsOperationId),
            Writers.object({ withoutParameters: 'true' }),
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
      () => console.group('\x1b[32m[@rxap/schematics-angular:select-form-control]\x1b[0m'),
      optionsRule(normalizedOptions),
      EnforceUseFormControlOrderRule(normalizedOptions),
      () => console.groupEnd(),
    ]);
  };
}
