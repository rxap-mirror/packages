import { chain } from '@angular-devkit/schematics';
import {
  AbstractControl,
  BuildNestControllerName,
  buildOperationId,
  CoerceFormControl,
  CoerceFormDefinitionControl,
  CoerceFormProviderRule,
  CoerceTableSelectResolveValueMethodRule,
  CoerceTableSelectValueResolveOperationRule,
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
import { NormalizedTableSelectFormControlOptions } from './normalize-table-select-form-control-options';

export function tableSelectResolveRule(normalizedOptions: NormalizedTableSelectFormControlOptions) {

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
    source,
    overwrite,
    identifier,
    backend,
  } = normalizedOptions;
  const { upstream } = resolver ?? {};

  const resolveValueOperationName = [ 'resolve', dasherize(name), 'control', 'value' ].join(
    '-',
  );
  const resolveValueOperationPath = [ 'control', dasherize(name), 'resolve', ':value' ].join(
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
      overwrite,
      propertyList,
      rowValueProperty: toValue.property,
      rowDisplayProperty: toDisplay.property,
      rowIdProperty: identifier.property,
      operationName: resolveValueOperationName,
      path: resolveValueOperationPath,
      dtoClassNameSuffix: buildDtoSuffix(normalizedOptions),
      context,
      backend,
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