import { chain } from '@angular-devkit/schematics';
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
import {
  NormalizedFormControlOptions,
  NormalizeFormControlOptions,
} from '../../form-control';
import { SelectFormControlOptions } from './schema';

export type NormalizedSelectFormControlOptions = Readonly<Normalized<SelectFormControlOptions> & NormalizedFormControlOptions>

export function NormalizeSelectFormControlOptions(
  options: SelectFormControlOptions,
): NormalizedSelectFormControlOptions {
  const normalizedOptions = NormalizeFormControlOptions(options);
  let { isArray } = normalizedOptions;
  const multiple = options.multiple ?? false;
  isArray = multiple ? true : isArray;
  return Object.seal({
    ...normalizedOptions,
    isArray,
    multiple,
    staticDataSource: options.staticDataSource ?? false,
  });
}

function printOptions(options: NormalizedSelectFormControlOptions) {
  PrintAngularOptions('select-form-control', options);
}

export default function (options: SelectFormControlOptions) {
  const normalizedOptions = NormalizeSelectFormControlOptions(options);
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
    staticDataSource,
    nestModule,
    controllerName,
    context,
    scope,
  } = normalizedOptions;
  printOptions(normalizedOptions);

  const optionsOperationName = [ 'get', name, 'options' ].join('-');
  const optionsOperationPath = [ 'options', name ].join('/');
  const optionsOperationId = buildOperationId(
    normalizedOptions,
    optionsOperationName,
    BuildNestControllerName({
      controllerName,
      nestModule,
    }),
  );
  const optionsDataSourceName = classify(
    [ name, 'options', 'data-source' ].join('-'),
  );
  const optionsDataSourceImportPath = `./data-sources/${ dasherize(
    name,
  ) }-options.data-source`;
  const optionsDataSourceDirectory = join(directory ?? '', 'data-sources');

  return () => {
    return chain([
      () => console.group('\x1b[32m[@rxap/schematics-angular:select-form-control]\x1b[0m'),
      ExecuteSchematic('form-control', normalizedOptions),
      () =>
        staticDataSource
          ? chain([
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
          ])
          : CoerceOptionsOperationRule({
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
          } =
            CoerceFormControl(sourceFile, classDeclaration, control);

          if (staticDataSource) {
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
          } else {
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
          }

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
