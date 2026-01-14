import {
  AngularOptions,
  NormalizedAngularOptions,
  NormalizedTreeTableAccordionItem,
  NormalizeTreeTableAccordionItem,
  TreeTableAccordionItem,
} from '@rxap/schematic-angular';
import { Normalized } from '@rxap/utilities';
import { NormalizeAccordionItemStandaloneComponentOptions } from '../../accordion-item-component/normalize-accordion-item-standalone-component-options';
import { AccordionItemTreeTableComponentOptions } from './schema';

export interface NormalizedAccordionItemTreeTableComponentOptions
  extends Readonly<Normalized<Omit<AccordionItemTreeTableComponentOptions, keyof AngularOptions | keyof TreeTableAccordionItem>> & NormalizedAngularOptions & NormalizedTreeTableAccordionItem> {
  controllerName: string;
  componentName: string;
  directory: string;
  nestModule: string;
}

export function NormalizeAccordionItemTreeTableComponentOptions(
  options: Readonly<AccordionItemTreeTableComponentOptions>,
): Readonly<NormalizedAccordionItemTreeTableComponentOptions> {
  return Object.freeze({
    ...NormalizeAccordionItemStandaloneComponentOptions(options),
    ...NormalizeTreeTableAccordionItem(options),
  });
}