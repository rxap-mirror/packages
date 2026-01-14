import { chain } from '@angular-devkit/schematics';
import { EnforceUseFormControlOrderRule } from '@rxap/schematics-ts-morph';
import { PrintAngularOptions } from '../../../../lib/print-angular-options';
import { autocompleteOptionsRule } from './autocomplete-options-rule';
import { autocompleteResolveRule } from './autocomplete-resolve-rule';
import {
  NormalizeAutocompleteFormControlOptions,
  NormalizedAutocompleteFormControlOptions,
} from './normalize-autocomplete-form-control-options';
import { AutocompleteFormControlOptions } from './schema';

function printOptions(options: NormalizedAutocompleteFormControlOptions) {
  PrintAngularOptions('autocomplete-form-control', options);
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
