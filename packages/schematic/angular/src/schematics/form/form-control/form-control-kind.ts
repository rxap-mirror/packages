import {
  noop,
  Rule,
} from '@angular-devkit/schematics';
import { FormControlKinds } from '@rxap/schematic-angular';
import { ExecuteSchematic } from '@rxap/schematics-utilities';
import { NormalizedFormControlOptions } from './normalize-form-control-options';

export function formControlKind(normalizedOptions: NormalizedFormControlOptions): Rule {
  switch (normalizedOptions.kind) {

    case FormControlKinds.INPUT:
      return ExecuteSchematic('input-form-control', normalizedOptions);

    case FormControlKinds.SELECT:
      return ExecuteSchematic('select-form-control', normalizedOptions);

    case FormControlKinds.TABLE_SELECT:
      return ExecuteSchematic('table-select-form-control', normalizedOptions);

    case FormControlKinds.AUTOCOMPLETE_TABLE_SELECT:
      return ExecuteSchematic('autocomplete-table-select-form-control', normalizedOptions);

    case FormControlKinds.AUTOCOMPLETE:
      return ExecuteSchematic('autocomplete-form-control', normalizedOptions);

    case FormControlKinds.DATE:
      return ExecuteSchematic('date-form-control', normalizedOptions);

    default:
      return () => console.log(`No schematic for form control kind: ${ normalizedOptions.kind }`.yellow);

  }

  return noop();
}