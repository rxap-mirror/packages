import {
  DataProperty,
  UpstreamOptions,
} from '@rxap/ts-morph';
import { AccordionHeader } from '../../../lib/accordion-header';
import { AccordionIdentifier } from '../../../lib/accordion-identifier';
import { BaseAccordionItem } from '../../../lib/accordion-item';
import { AngularOptions } from '../../../lib/angular-options';
import { Persistent } from '../../../lib/persistent';

export interface AccordionComponentOptions extends AngularOptions {
  itemList?: Array<BaseAccordionItem>;
  multiple?: boolean;
  persistent?: Persistent;
  header?: AccordionHeader;
  identifier?: AccordionIdentifier;
  upstream?: UpstreamOptions;
  propertyList?: DataProperty[];
}
