import { AccordionItem } from '../../../lib/accordion/accordion-item';
import { AngularOptions } from '../../../lib/angular-options';

// AccordionItem is a union type. For this reason, we need to use the export type syntax instead of export interface.
// Or else the subtypes of AccordionItem will not be recognized correctly.
export type AccordionItemComponentOptions = AngularOptions & AccordionItem & { accordionName: string; };
