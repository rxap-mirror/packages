import { noop } from '@angular-devkit/schematics';
import { formModeRule } from './form-mode-rule';
import { NormalizedDataGridComponentOptions } from './normalize-data-grid-component-options';

export function modeRule(normalizedOptions: NormalizedDataGridComponentOptions) {

  const {
    isForm,
    itemList,
  } = normalizedOptions;

  if (isForm) {
    return formModeRule(normalizedOptions);
  }

  return noop();

}