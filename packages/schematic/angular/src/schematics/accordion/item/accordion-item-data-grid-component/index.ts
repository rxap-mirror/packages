import { chain } from '@angular-devkit/schematics';
import { printAccordionItemComponentOptions } from '../../accordion-item-component';
import { backendRule } from './backend/backend-rule';
import { componentRule } from './component-rule';
import { dataGridModeRule } from './data-grid-mode-rule';
import {
  NormalizeAccordionItemDataGridComponentOptions,
  NormalizedAccordionItemDataGridComponentOptions,
} from './normalize-accordion-item-data-grid-component-options';
import { AccordionItemDataGridComponentOptions } from './schema';

function printOptions(options: NormalizedAccordionItemDataGridComponentOptions) {
  printAccordionItemComponentOptions(options, 'accordion-item-data-grid-component');
  if (options.dataGrid.itemList.length) {
    console.log(`===== Data Grid Items: \x1b[34m${ options.dataGrid.itemList.map((item) => item.name).join(', ') }\x1b[0m`);
  } else {
    console.log('===== Data Grid Items: \x1b[31mempty\x1b[0m');
  }
}

export default function (options: AccordionItemDataGridComponentOptions) {
  const normalizedOptions = NormalizeAccordionItemDataGridComponentOptions(options);
  printOptions(normalizedOptions);
  return () => {
    return chain([
      componentRule(normalizedOptions),
      backendRule(normalizedOptions),
      dataGridModeRule(normalizedOptions),
    ]);
  };
}
