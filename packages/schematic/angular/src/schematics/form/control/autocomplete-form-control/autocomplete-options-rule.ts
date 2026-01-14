import { chain } from '@angular-devkit/schematics';
import { TsMorphAngularProjectTransformRule } from '@rxap/schematics-ts-morph';
import {
  CoerceImports,
  CoerceTokenExport,
} from '@rxap/ts-morph';
import { underscore } from '@rxap/utilities';
import { CoerceUseAutocompleteOptionsMethod } from './coerce-use-autocomplete-options-method';
import { NormalizedAutocompleteFormControlOptions } from './normalize-autocomplete-form-control-options';

export function autocompleteOptionsRule(normalizedOptions: NormalizedAutocompleteFormControlOptions) {

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
    TsMorphAngularProjectTransformRule(normalizedOptions, (_, [ sourceFile ]) => {
      CoerceTokenExport(sourceFile, {
        name: tokenName,
        description: `The options method for the ${ name } autocomplete form control`,
        type: {
          name: 'AutocompleteOptionsMethod',
          moduleSpecifier: 'autocomplete-table-select',
        },
      });
    }, [ 'tokens.ts?' ]),
  ]);
}