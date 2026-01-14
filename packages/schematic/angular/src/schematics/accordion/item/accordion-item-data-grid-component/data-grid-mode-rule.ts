import { noop } from '@angular-devkit/schematics';
import { dataGridFormModeRule } from './data-grid-form-mode-rule';
import { NormalizedAccordionItemDataGridComponentOptions } from './normalize-accordion-item-data-grid-component-options';

export function dataGridModeRule(normalizedOptions: NormalizedAccordionItemDataGridComponentOptions) {

  const {
    dataGrid: {
      mode,
      isForm,
    },
  } = normalizedOptions;

  if (isForm) {
    return dataGridFormModeRule(normalizedOptions);
  }

  return noop();

}