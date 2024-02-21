import { TableAccordionItem } from '../../../../lib/accordion-item';
import { AccordionItemComponentOptions } from '../../accordion-item-component/schema';

export type AccordionItemTableComponentOptions = Omit<TableAccordionItem & AccordionItemComponentOptions, 'type'>;
