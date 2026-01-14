import { noop } from '@angular-devkit/schematics';
import { NormalizedDataGridComponentOptions } from '../normalize-data-grid-component-options';
import { nestjsFormModeRule } from './nestjs-form-mode-rule';

export function nestjsModeRule(normalizedOptions: NormalizedDataGridComponentOptions) {

  const { isForm } = normalizedOptions;

  if (isForm) {
    return nestjsFormModeRule(normalizedOptions);
  }

  return noop();

}