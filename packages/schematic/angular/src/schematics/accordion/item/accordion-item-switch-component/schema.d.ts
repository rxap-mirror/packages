import { SwitchAccordionItem } from '../../../../lib/accordion-item';
import { AccordionItemComponentOptions } from '../../accordion-item-component/schema';

export type AccordionItemSwitchComponentOptions = Omit<SwitchAccordionItem & AccordionItemComponentOptions, 'kind'>
