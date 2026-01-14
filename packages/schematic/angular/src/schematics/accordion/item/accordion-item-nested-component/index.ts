import { chain } from '@angular-devkit/schematics';
import { printAccordionItemComponentOptions } from '../../accordion-item-component';
import { accordionComponentRule } from './accordion-component-rule';
import {
  NormalizeAccordionItemNestedComponentOptions,
  NormalizedAccordionItemNestedComponentOptions,
} from './normalize-accordion-item-nested-component-options';
import { AccordionItemNestedComponentOptions } from './schema';

function printOptions(options: NormalizedAccordionItemNestedComponentOptions) {
  printAccordionItemComponentOptions(options, 'accordion-item-nested-component');
}

export default function (options: AccordionItemNestedComponentOptions) {
  const normalizedOptions = NormalizeAccordionItemNestedComponentOptions(options);
  printOptions(normalizedOptions);
  return () => {
    return chain([
      accordionComponentRule(normalizedOptions),
    ]);
  };
}
