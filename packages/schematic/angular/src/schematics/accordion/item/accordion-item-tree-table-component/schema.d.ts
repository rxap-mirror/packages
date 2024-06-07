import { TreeTableAccordionItem } from '../../../../lib/accordion/item/tree-table-accordion-item';
import { AngularOptions } from '../../../../lib/angular-options';

export interface AccordionItemTreeTableComponentOptions extends TreeTableAccordionItem, AngularOptions {
  accordionName: string;
}
