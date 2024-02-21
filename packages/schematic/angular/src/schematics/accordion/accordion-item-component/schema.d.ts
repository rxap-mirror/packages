import { BaseAccordionItem } from '../../../lib/accordion-item';
import { AngularOptions } from '../../../lib/angular-options';

export interface AccordionItemComponentOptions extends Omit<AngularOptions, 'name'>, BaseAccordionItem {
  itemName: string;
  accordionName: string;
}
