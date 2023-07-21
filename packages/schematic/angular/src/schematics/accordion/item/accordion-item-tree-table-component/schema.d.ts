import { AccordionItemComponentOptions } from '../../accordion-item-component/schema';
import { TreeTableOptions } from '../../../../lib/tree-table-options';

export interface AccordionItemTreeTableComponentOptions
  extends Omit<AccordionItemComponentOptions, 'type'> {
  table: TreeTableOptions;
}
