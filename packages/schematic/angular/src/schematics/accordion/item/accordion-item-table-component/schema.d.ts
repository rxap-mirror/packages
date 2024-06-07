import { TableAccordionItem } from '../../../../lib/accordion/item/table-accordion-item';
import { AngularOptions } from '../../../../lib/angular-options';

export interface AccordionItemTableComponentOptions extends TableAccordionItem, AngularOptions {
  accordionName: string;
}
