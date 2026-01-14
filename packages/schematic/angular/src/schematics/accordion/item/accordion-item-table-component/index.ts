import { chain } from '@angular-devkit/schematics';
import { printAccordionItemComponentOptions } from '../../accordion-item-component';
import { componentRule } from './component-rule';
import {
  NormalizeAccordionItemTableComponentOptions,
  NormalizedAccordionItemTableComponentOptions,
} from './normalize-accordion-item-table-component-options';
import { AccordionItemTableComponentOptions } from './schema';
import { tableComponentSchematicRule } from './table-component-schematic-rule';

function printOptions(options: NormalizedAccordionItemTableComponentOptions) {
  printAccordionItemComponentOptions(options, 'accordion-item-table-component');
}

export default function (options: AccordionItemTableComponentOptions) {
  const normalizedOptions = NormalizeAccordionItemTableComponentOptions(options);
  printOptions(normalizedOptions);
  return () => {
    return chain([
      componentRule(normalizedOptions),
      () => console.log(`Modify accordion item component for type table ...`),
      tableComponentSchematicRule(normalizedOptions),
    ]);
  };
}
