import { chain } from '@angular-devkit/schematics';
import { EnforceUseFormControlOrderRule } from '@rxap/schematics-ts-morph';
import { PrintAngularOptions } from '../../../../lib/print-angular-options';
import { autocompleteTableSelectOptionsRule } from './autocomplete-table-select-options-rule';
import { autocompleteTableSelectResolveRule } from './autocomplete-table-select-resolve-rule';
import {
  NormalizedTableSelectFormControlOptions,
  NormalizeTableSelectFormControlOptions,
} from './normalize-table-select-form-control-options';
import { AutocompleteTableSelectFormControlOptions } from './schema';
import { tableSelectDataSourceRule } from './table-select-data-source-rule';

function printOptions(options: NormalizedTableSelectFormControlOptions) {
  PrintAngularOptions('autocomplete-table-select-form-control', options);
}

export default function (options: AutocompleteTableSelectFormControlOptions) {
  const normalizedOptions = NormalizeTableSelectFormControlOptions(options);
  printOptions(normalizedOptions);

  return () => {
    return chain([
      () => console.group('[@rxap/schematics-angular:autocomplete-table-select-form-control]'.green),
      tableSelectDataSourceRule(normalizedOptions),
      autocompleteTableSelectResolveRule(normalizedOptions),
      autocompleteTableSelectOptionsRule(normalizedOptions),
      EnforceUseFormControlOrderRule(normalizedOptions),
      () => console.groupEnd(),
    ]);
  };
}
