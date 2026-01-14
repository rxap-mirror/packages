import { chain } from '@angular-devkit/schematics';
import { printAccordionItemComponentOptions } from '../../accordion-item-component';
import {
  caseListRule,
  defaultCaseRule,
} from './case/case-rule';
import {
  NormalizeAccordionItemSwitchComponentOptions,
  NormalizedAccordionItemSwitchComponentOptions,
} from './normalize-accordion-item-switch-component-options';
import { AccordionItemSwitchComponentOptions } from './schema';

function printOptions(options: NormalizedAccordionItemSwitchComponentOptions) {
  printAccordionItemComponentOptions(options, 'accordion-item-switch-component');
}

export default function (options: AccordionItemSwitchComponentOptions) {
  const normalizedOptions = NormalizeAccordionItemSwitchComponentOptions(options);
  printOptions(normalizedOptions);
  return () => {
    return chain([
      caseListRule(normalizedOptions),
      defaultCaseRule(normalizedOptions),
    ]);
  };
}
