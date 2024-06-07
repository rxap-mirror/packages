import { DataGridAccordionItem } from '../../../../lib/accordion/item/data-grid-accordion-item';
import { AngularOptions } from '../../../../lib/angular-options';

export interface AccordionItemDataGridComponentOptions extends DataGridAccordionItem, AngularOptions {
  accordionName: string;
}
