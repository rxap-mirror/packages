import { NestedAccordionItem } from '../../../../lib/accordion/item/nested-accordion-item';
import { AccordionItemComponentOptions } from '../../accordion-item-component/schema';

export type AccordionItemNestedComponentOptions = Omit<NestedAccordionItem & AccordionItemComponentOptions, 'kind'>
