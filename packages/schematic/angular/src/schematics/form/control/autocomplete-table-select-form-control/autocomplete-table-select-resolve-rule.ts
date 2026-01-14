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
  CoerceAutocompleteTableSelectValueResolveOperationRule,
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

export function autocompleteTableSelectResolveRule(normalizedOptions: NormalizedTableSelectFormControlOptions) {

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
    overwrite,
    identifier,
    backend,
    source,
  } = normalizedOptions;
  const {
    upstream,
    method,
  } = resolver ?? {};

  const rules: Rule[] = [];

  let autocompleteResolveMethod: string | null = null;
  let autocompleteResolveMethodModuleSpecifier: string | null = null;

  if (method) {
    switch (method.kind) {
      case MethodKinds.OPEN_API:
        AssertIsNormalizedOpenApiMethodOptions(method);
        autocompleteResolveMethod = OperationIdToRemoteMethodClassName(method.operationId);
        autocompleteResolveMethodModuleSpecifier = OperationIdToClassRemoteMethodImportPath(method.operationId, scope);
        break;
      case MethodKinds.IMPORT:
        AssertIsNormalizedImportMethodOptions(method);
        autocompleteResolveMethod = method.import.name;
        autocompleteResolveMethodModuleSpecifier = method.import.moduleSpecifier;
        if (!autocompleteResolveMethodModuleSpecifier) {
          throw new Error('The import module specifier is required for a autocomplete table select control resolver!');
        }
        rules.push(CoerceFormProviderRule({
          project,
          feature,
          directory,
          providerObject: autocompleteResolveMethod,
          importStructures: [
            {
              namedImports: [ autocompleteResolveMethod ],
              moduleSpecifier: autocompleteResolveMethodModuleSpecifier,
            },
          ],
        }));
        break;
      default:
        throw new Error(
          `The method kind ${ method.kind } is not supported for a autocomplete table select control resolver!`);
    }
  } else {
    switch (backend.kind) {
      case BackendTypes.NESTJS:
        // eslint-disable-next-line no-case-declarations
        const resolveValueOperationName = [ 'resolve', dasherize(name), 'control', 'value' ].join(
          '-',
        );
        // eslint-disable-next-line no-case-declarations
        const resolveValueOperationId = buildOperationId(
          normalizedOptions,
          resolveValueOperationName,
          BuildNestControllerName({
            controllerName,
            nestModule,
          }),
        );
        autocompleteResolveMethod = OperationIdToRemoteMethodClassName(resolveValueOperationId);
        autocompleteResolveMethodModuleSpecifier = OperationIdToClassRemoteMethodImportPath(
          resolveValueOperationId, scope);
        rules.push(
          CoerceAutocompleteTableSelectValueResolveOperationRule({
            project,
            feature,
            nestModule,
            controllerName,
            upstream,
            overwrite,
            propertyList: propertyList.slice(),
            rowValueProperty: toValue.property,
            rowDisplayProperty: toDisplay.property,
            operationName: resolveValueOperationName,
            path: [ 'control', dasherize(name), 'resolve', ':value' ].join('/'),
            dtoClassNameSuffix: joinWithDash([ context, dasherize(name), 'control', 'options' ]),
            context,
            backend,
          }),
        );
        break;
      default:
        throw new Error(
          `The backend kind ${ backend.kind } is not supported for a autocomplete table select control resolver!`);
    }
  }

  if (!autocompleteResolveMethod || !autocompleteResolveMethodModuleSpecifier) {
    throw new Error('The backend kind is not nestjs and a resolver method is not provided!');
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

        CoerceDecorator(propertyDeclaration, 'UseResolveMethod', {
          arguments: [
            autocompleteResolveMethod,
          ],
        });
        CoerceImports(sourceFile, {
          namedImports: [ autocompleteResolveMethod ],
          moduleSpecifier: autocompleteResolveMethodModuleSpecifier,
        });
        CoerceImports(sourceFile, {
          namedImports: [
            'UseResolveMethod',
          ],
          moduleSpecifier: '@rxap/form-system',
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