import {
  AngularOptions,
  NormalizedAngularOptions,
  NormalizedTableAccordionItem,
  NormalizeTableAccordionItem,
  TableAccordionItem,
} from '@rxap/schematic-angular';
import { Normalized } from '@rxap/utilities';
import { NormalizeAccordionItemStandaloneComponentOptions } from '../../accordion-item-component/normalize-accordion-item-standalone-component-options';
import { AccordionItemTableComponentOptions } from './schema';

export interface NormalizedAccordionItemTableComponentOptions
  extends Readonly<Normalized<Omit<AccordionItemTableComponentOptions, keyof AngularOptions | keyof TableAccordionItem>> & NormalizedAngularOptions & NormalizedTableAccordionItem> {
  controllerName: string;
  componentName: string;
  directory: string;
  nestModule: string;
}

export function NormalizeAccordionItemTableComponentOptions(
  options: Readonly<AccordionItemTableComponentOptions>,
): Readonly<NormalizedAccordionItemTableComponentOptions> {
  return Object.freeze({
    ...NormalizeAccordionItemStandaloneComponentOptions(options),
    ...NormalizeTableAccordionItem(options),
  });
}