import { AccordionItem } from '../../../../lib/accordion-item';
import { AccordionItemComponentOptions } from '../../accordion-item-component/schema';

export interface AccordionItemSwitchComponentOptions
  extends Omit<AccordionItemComponentOptions, 'type'> {
  switch: {
    property: {
      name: string;
      type?: string;
    };
    case: Array<{
      test: string;
      itemList: Array<Omit<AccordionItem, 'type'> & Partial<AccordionItem>>
    }>;
    defaultCase?: {
      itemList: Array<Omit<AccordionItem, 'type'> & Partial<AccordionItem>>
    }
  }
}
