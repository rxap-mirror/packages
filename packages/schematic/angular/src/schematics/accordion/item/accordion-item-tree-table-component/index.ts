import { chain } from '@angular-devkit/schematics';
import { printAccordionItemComponentOptions } from '../../accordion-item-component';
import { backendRule } from './backend/backend-rule';
import { componentRule } from './component-rule';
import {
  NormalizeAccordionItemTreeTableComponentOptions,
  NormalizedAccordionItemTreeTableComponentOptions,
} from './normalize-accordion-item-tree-table-component-options';
import { AccordionItemTreeTableComponentOptions } from './schema';
import { treeTableComponentSchematicRule } from './tree-table-component-schematic-rule';

function printOptions(options: NormalizedAccordionItemTreeTableComponentOptions) {
  printAccordionItemComponentOptions(options, 'accordion-item-tree-table-component');
}

export default function (options: AccordionItemTreeTableComponentOptions) {
  const normalizedOptions = NormalizeAccordionItemTreeTableComponentOptions(options);
  printOptions(normalizedOptions);
  return () => {
    return chain([
      componentRule(normalizedOptions),
      () => console.log(`Modify accordion item component for type tree table ...`),
      treeTableComponentSchematicRule(normalizedOptions),
      backendRule(normalizedOptions),
    ]);
  };
}
