import { AngularOptions } from '../../../lib/angular-options';
import { AccordionItem } from '../../../lib/accordion-item';

export interface AccordionComponentOptions extends AngularOptions {
  itemList?: Array<string | AccordionItem>;
  multiple?: boolean;
}
