import {
  AbstractControl,
  CoerceFormControl,
  CoerceFormDefinitionControl,
} from '@rxap/schematics-ts-morph';
import {
  CoerceDecorator,
  CoerceImports,
} from '@rxap/ts-morph';
import {
  ClassDeclaration,
  SourceFile,
} from 'ts-morph';
import { NormalizedAutocompleteFormControlOptions } from './normalize-autocomplete-form-control-options';

export function CoerceUseAutocompleteResolveMethod(
  normalizedOptions: NormalizedAutocompleteFormControlOptions,
  injectionToken: string,
  hook?: (classDeclaration: ClassDeclaration) => void,
) {

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
  } = normalizedOptions;

  return CoerceFormDefinitionControl({
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

      CoerceDecorator(propertyDeclaration, 'UseResolveMethod').set({
        arguments: [
          injectionToken,
        ],
      });
      hook?.(classDeclaration);
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
  });

}