import { AccordionItemComponentOptions } from '../../accordion-item-component/schema';
import { TableOptions } from '../../../../lib/table-options';

export interface AccordionItemTableComponentOptions
  extends Omit<AccordionItemComponentOptions, 'type'> {
  table: TableOptions;
}
