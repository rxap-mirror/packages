import { TreeTableAccordionItem } from '../../../../lib/accordion/item/tree-table-accordion-item';
import { AccordionItemComponentOptions } from '../../accordion-item-component/schema';

export type AccordionItemTreeTableComponentOptions = Omit<TreeTableAccordionItem & AccordionItemComponentOptions, 'kind'>
