import { AccordionItemTypes } from '../../../lib/accordion-itme-types';
import { AngularOptions } from '../../../lib/angular-options';

export interface AccordionItemComponentOptions extends AngularOptions {
  itemName: string;
  type: AccordionItemTypes;
  accordionName: string;
  modifiers?: string[];
}
