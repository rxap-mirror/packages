import {
  chain,
  Rule,
} from '@angular-devkit/schematics';
import {
  AbstractControl,
  BuildNestControllerName,
  buildOperationId,
  CoerceFormControl,
  CoerceFormDefinitionControl,
  CoerceOptionsOperationRule,
} from '@rxap/schematics-ts-morph';
import { dasherize } from '@rxap/schematics-utilities';
import {
  CoerceDecorator,
  CoerceImports,
  OperationIdToClassRemoteMethodImportPath,
  OperationIdToRemoteMethodClassName,
} from '@rxap/ts-morph';
import {
  ClassDeclaration,
  SourceFile,
} from 'ts-morph';
import { NormalizedSelectFormControlOptions } from '../normalize-select-form-control-options';

export function nestJsBackendOptionsRule(normalizedOptions: NormalizedSelectFormControlOptions): Rule {
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
    backend,
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
      backend,
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

        CoerceDecorator(propertyDeclaration, 'UseOptionsMethod', {
          arguments: [
            OperationIdToRemoteMethodClassName(optionsOperationId),
          ],
        });
        CoerceImports(sourceFile, {
          namedImports: [ OperationIdToRemoteMethodClassName(optionsOperationId) ],
          moduleSpecifier: OperationIdToClassRemoteMethodImportPath(optionsOperationId, scope),
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
    }),
  ]);
}