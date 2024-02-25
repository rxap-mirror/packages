import { DataGridAccordionItem } from '../../../../lib/accordion-item';
import { AccordionItemComponentOptions } from '../../accordion-item-component/schema';

export type AccordionItemDataGridComponentOptions = Omit<DataGridAccordionItem & AccordionItemComponentOptions, 'kind'>
