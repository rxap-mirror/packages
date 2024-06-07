import { SwitchAccordionItem } from '../../../../lib/accordion/item/switch-accordion-item';
import { AngularOptions } from '../../../../lib/angular-options';

export interface AccordionItemSwitchComponentOptions extends SwitchAccordionItem, AngularOptions {
  accordionName: string;
}
