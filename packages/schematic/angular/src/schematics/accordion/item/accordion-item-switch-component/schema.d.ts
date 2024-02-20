import { AccordionItem } from '../../../../lib/accordion-item';
import { DataProperty } from '@rxap/ts-morph';
import { AccordionItemComponentOptions } from '../../accordion-item-component/schema';

export interface AccordionItemSwitchComponentOptions
  extends Omit<AccordionItemComponentOptions, 'type'> {
  switch: {
    property: DataProperty;
    case: Array<{
      test: string;
      itemList: Array<Omit<AccordionItem, 'type'> & Partial<AccordionItem>>
    }>;
    defaultCase?: {
      itemList: Array<Omit<AccordionItem, 'type'> & Partial<AccordionItem>>
    }
  }
}
