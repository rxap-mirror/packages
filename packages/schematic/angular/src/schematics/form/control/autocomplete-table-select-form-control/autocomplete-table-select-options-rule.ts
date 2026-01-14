import {
  chain,
  Rule,
} from '@angular-devkit/schematics';
import {
  AssertIsNormalizedImportMethodOptions,
  AssertIsNormalizedOpenApiMethodOptions,
  BackendTypes,
  MethodKinds,
} from '@rxap/schematic-angular';
import {
  AbstractControl,
  BuildNestControllerName,
  buildOperationId,
  CoerceAutocompleteOptionsOperationRule,
  CoerceFormControl,
  CoerceFormDefinitionControl,
  CoerceFormProviderRule,
} from '@rxap/schematics-ts-morph';
import { dasherize } from '@rxap/schematics-utilities';
import {
  CoerceDecorator,
  CoerceImports,
  OperationIdToClassRemoteMethodImportPath,
  OperationIdToRemoteMethodClassName,
} from '@rxap/ts-morph';
import { joinWithDash } from '@rxap/utilities';
import {
  ClassDeclaration,
  SourceFile,
} from 'ts-morph';
import { NormalizedTableSelectFormControlOptions } from './normalize-table-select-form-control-options';

export function autocompleteTableSelectOptionsRule(normalizedOptions: NormalizedTableSelectFormControlOptions) {

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
        throw new Error(
          `The method kind ${ method.kind } is not supported for a autocomplete table select control options!`);
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
        throw new Error(
          `The backend kind ${ backend.kind } is not supported for a autocomplete table select control options!`);
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