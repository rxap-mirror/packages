import { AccordionItem } from '../../../lib/accordion-item';
import { AngularOptions } from '../../../lib/angular-options';
import { Persistent } from '../../../lib/persistent';

export interface AccordionComponentOptions extends AngularOptions {
  itemList?: Array<string | AccordionItem>;
  multiple?: boolean;
  persistent?: Persistent
}
