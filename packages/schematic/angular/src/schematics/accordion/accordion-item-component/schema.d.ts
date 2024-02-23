import { BaseAccordionItem } from '../../../lib/accordion-item';
import { AngularOptions } from '../../../lib/angular-options';

export interface AccordionItemComponentOptions extends AngularOptions, BaseAccordionItem {
  name: string;
  accordionName: string;
}
