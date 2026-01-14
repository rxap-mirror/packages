import { chain } from '@angular-devkit/schematics';
import {
  AbstractControl,
  BuildNestControllerName,
  CoerceFormControl,
  CoerceFormDefinitionControl,
  EnforceUseFormControlOrderRule,
  TsMorphAngularProjectTransformRule,
} from '@rxap/schematics-ts-morph';
import {
  CoerceDecorator,
  CoerceImports,
  CoerceTokenExport,
  CoerceVariableDeclaration,
  TypeImport,
  TypeImportToImportStructure,
} from '@rxap/ts-morph';
import {
  NonNullableSelected,
  Normalized,
  underscore,
} from '@rxap/utilities';
import {
  ClassDeclaration,
  SourceFile,
  VariableDeclarationKind,
} from 'ts-morph';
import {
  AutocompleteFormControl,
  NormalizeAutocompleteFormControl,
  NormalizedAutocompleteFormControl,
} from '../../../../lib/form/control/autocomplete-form-control';
import { PrintAngularOptions } from '../../../../lib/print-angular-options';
import {
  NormalizedFormControlOptions,
  NormalizeFormControlOptions,
} from '../../form-control';
import { FormControlOptions } from '../../form-control/schema';
import { AutocompleteFormControlOptions } from './schema';

export type NormalizedAutocompleteFormControlOptions = NonNullableSelected<Readonly<Normalized<Omit<AutocompleteFormControlOptions, keyof FormControlOptions | keyof AutocompleteFormControl>>> & NormalizedFormControlOptions & NormalizedAutocompleteFormControl, 'controllerName'>

export function NormalizeAutocompleteFormControlOptions(
  options: AutocompleteFormControlOptions,
): NormalizedAutocompleteFormControlOptions {
  const normalizedOptions = NormalizeFormControlOptions(options);
  return Object.freeze({
    ...normalizedOptions,
    ...NormalizeAutocompleteFormControl(options),
    controllerName: BuildNestControllerName(normalizedOptions),
  });
}

function printOptions(options: NormalizedAutocompleteFormControlOptions) {
  PrintAngularOptions('autocomplete-form-control', options);
}

function CoerceUseAutocompleteResolveMethod(
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

function CoerceUseAutocompleteOptionsMethod(
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

      CoerceDecorator(propertyDeclaration, 'UseAutocompleteOptionsMethod').set({
        arguments: [
          injectionToken,
        ],
      });
      hook?.(classDeclaration);
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
  });

}

function autocompleteResolveRule(normalizedOptions: NormalizedAutocompleteFormControlOptions) {

  const {
    name,
    formName,
  } = normalizedOptions;

  const tokenName = underscore([ formName, name, 'autocomplete', 'resolve', 'method' ].join('-')).toUpperCase();

  return chain([
    CoerceUseAutocompleteResolveMethod(normalizedOptions, tokenName, classDeclaration => {
      CoerceImports(classDeclaration.getSourceFile(), {
        namedImports: [ tokenName ],
        moduleSpecifier: './tokens',
      });
    }),
    TsMorphAngularProjectTransformRule(normalizedOptions, (_, [sourceFile]) => {
      CoerceTokenExport(sourceFile, {
        name: tokenName,
        description: `The resolve method for the ${ name } autocomplete form control`,
        type: {
          name: 'AutocompleteResolveMethod',
          moduleSpecifier: 'autocomplete-table-select',
        },
      });
    },[ 'tokens.ts?' ]),
  ]);
}

function autocompleteOptionsRule(normalizedOptions: NormalizedAutocompleteFormControlOptions) {

  const {
    name,
    formName,
  } = normalizedOptions;

  const tokenName = underscore([ formName, name, 'autocomplete', 'options', 'method' ].join('-')).toUpperCase();

  return chain([
    CoerceUseAutocompleteOptionsMethod(
      normalizedOptions,
      tokenName,
      classDeclaration => {
        CoerceImports(classDeclaration.getSourceFile(), {
          namedImports: [ tokenName ],
          moduleSpecifier: './tokens',
        });
      },
    ),
    TsMorphAngularProjectTransformRule(normalizedOptions, (_, [sourceFile]) => {
      CoerceTokenExport(sourceFile, {
        name: tokenName,
        description: `The options method for the ${ name } autocomplete form control`,
        type: {
          name: 'AutocompleteOptionsMethod',
          moduleSpecifier: 'autocomplete-table-select',
        },
      });
    },[ 'tokens.ts?' ]),
  ]);
}

export default function (options: AutocompleteFormControlOptions) {
  const normalizedOptions = NormalizeAutocompleteFormControlOptions(options);
  printOptions(normalizedOptions);

  return () => {
    return chain([
      () => console.group('[@rxap/schematics-angular:autocomplete-table-select-form-control]'.green),
      autocompleteResolveRule(normalizedOptions),
      autocompleteOptionsRule(normalizedOptions),
      EnforceUseFormControlOrderRule(normalizedOptions),
      () => console.groupEnd(),
    ]);
  };
}
