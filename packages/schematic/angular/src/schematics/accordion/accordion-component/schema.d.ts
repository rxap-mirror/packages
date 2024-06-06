import {
  DataProperty,
  UpstreamOptions,
} from '@rxap/ts-morph';
import { AccordionIdentifier } from '../../../lib/accordion-identifier';
import { AccordionHeader } from '../../../lib/accordion/accordion-header';
import { AccordionItem } from '../../../lib/accordion/accordion-item';
import { AngularOptions } from '../../../lib/angular-options';
import { Persistent } from '../../../lib/persistent';

export interface AccordionComponentOptions extends AngularOptions {
  itemList?: Array<AccordionItem>;
  multiple?: boolean;
  persistent?: Persistent;
  header?: AccordionHeader;
  identifier?: AccordionIdentifier;
  upstream?: UpstreamOptions;
  propertyList?: DataProperty[];
}
