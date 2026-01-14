import { chain } from '@angular-devkit/schematics';
import { EnforceUseFormControlOrderRule } from '@rxap/schematics-ts-morph';
import { PrintAngularOptions } from '../../../../lib/print-angular-options';
import {
  NormalizedTableSelectFormControlOptions,
  NormalizeTableSelectFormControlOptions,
} from './normalize-table-select-form-control-options';
import { TableSelectFormControlOptions } from './schema';
import { tableSelectDataSourceRule } from './table-select-data-source-rule';
import { tableSelectResolveRule } from './table-select-resolve-rule';

function printOptions(options: NormalizedTableSelectFormControlOptions) {
  PrintAngularOptions('table-select-form-control', options);
}

export default function (options: TableSelectFormControlOptions) {
  const normalizedOptions = NormalizeTableSelectFormControlOptions(options);
  printOptions(normalizedOptions);

  return () => {
    return chain([
      () => console.group('[@rxap/schematics-angular:table-select-form-control]'.green),
      tableSelectDataSourceRule(normalizedOptions),
      tableSelectResolveRule(normalizedOptions),
      EnforceUseFormControlOrderRule(normalizedOptions),
      () => console.groupEnd(),
    ]);
  };
}
