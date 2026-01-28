import {
  AngularOptions,
  NestedAccordionItem,
  NormalizedAngularOptions,
  NormalizedNestedAccordionItem,
  NormalizeNestedAccordionItem,
} from '@rxap/schematic-angular';
import { Normalized } from '@rxap/utilities';
import { NormalizeAccordionItemStandaloneComponentOptions } from '../../accordion-item-component/normalize-accordion-item-standalone-component-options';
import { AccordionItemNestedComponentOptions } from './schema';

export interface NormalizedAccordionItemNestedComponentOptions
  extends Readonly<Normalized<Omit<AccordionItemNestedComponentOptions, keyof AngularOptions | keyof NestedAccordionItem>> & NormalizedAngularOptions & NormalizedNestedAccordionItem> {
  controllerName: string;
  componentName: string;
  directory: string;
  nestModule: string;
}

export function NormalizeAccordionItemNestedComponentOptions(
  options: Readonly<AccordionItemNestedComponentOptions>,
): Readonly<NormalizedAccordionItemNestedComponentOptions> {
  const normalized = NormalizeAccordionItemStandaloneComponentOptions(options);
  return Object.freeze({
    ...normalized,
    ...NormalizeNestedAccordionItem(options, normalized.backend),
  });
}