import { AccordionItemComponentOptions } from '../../accordion-item-component/schema';
import { DataGridOptions } from '../../../../lib/data-grid-options';

export interface AccordionItemDataGridComponentOptions
  extends Omit<AccordionItemComponentOptions, 'type'> {
  dataGrid: DataGridOptions;
}
