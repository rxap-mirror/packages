import { dasherize } from '@rxap/schematics-utilities';
import { joinWithDash } from '@rxap/utilities';
import { NormalizedTableSelectFormControlOptions } from './normalize-table-select-form-control-options';

export function buildDtoSuffix({
  context,
  name,
}: NormalizedTableSelectFormControlOptions) {
  return joinWithDash([ context, dasherize(name), 'table-select' ]);
}