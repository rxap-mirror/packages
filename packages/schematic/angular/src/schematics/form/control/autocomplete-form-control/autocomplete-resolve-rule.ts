import { chain } from '@angular-devkit/schematics';
import { TsMorphAngularProjectTransformRule } from '@rxap/schematics-ts-morph';
import {
  CoerceImports,
  CoerceTokenExport,
} from '@rxap/ts-morph';
import { underscore } from '@rxap/utilities';
import { CoerceUseAutocompleteResolveMethod } from './coerce-use-autocomplete-resolve-method';
import { NormalizedAutocompleteFormControlOptions } from './normalize-autocomplete-form-control-options';

export function autocompleteResolveRule(normalizedOptions: NormalizedAutocompleteFormControlOptions) {

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
    TsMorphAngularProjectTransformRule(normalizedOptions, (_, [ sourceFile ]) => {
      CoerceTokenExport(sourceFile, {
        name: tokenName,
        description: `The resolve method for the ${ name } autocomplete form control`,
        type: {
          name: 'AutocompleteResolveMethod',
          moduleSpecifier: 'autocomplete-table-select',
        },
      });
    }, [ 'tokens.ts?' ]),
  ]);
}