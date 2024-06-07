import { NestedAccordionItem } from '../../../../lib/accordion/item/nested-accordion-item';
import { AngularOptions } from '../../../../lib/angular-options';

export interface AccordionItemNestedComponentOptions extends NestedAccordionItem, AngularOptions {
  accordionName: string;
}
