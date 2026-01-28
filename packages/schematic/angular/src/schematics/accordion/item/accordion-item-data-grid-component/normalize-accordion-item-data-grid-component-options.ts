import {
  AngularOptions,
  DataGridAccordionItem,
  NormalizedAngularOptions,
  NormalizeDataGridAccordionItem,
  NormalizedDataGridAccordionItem,
} from '@rxap/schematic-angular';
import { Normalized } from '@rxap/utilities';
import { NormalizeAccordionItemStandaloneComponentOptions } from '../../accordion-item-component/normalize-accordion-item-standalone-component-options';
import { AccordionItemDataGridComponentOptions } from './schema';

export interface NormalizedAccordionItemDataGridComponentOptions
  extends Readonly<Normalized<Omit<AccordionItemDataGridComponentOptions, keyof AngularOptions | keyof DataGridAccordionItem>> & NormalizedAngularOptions & NormalizedDataGridAccordionItem> {
  controllerName: string;
  componentName: string;
  directory: string;
  nestModule: string;
}

export function NormalizeAccordionItemDataGridComponentOptions(
  options: Readonly<AccordionItemDataGridComponentOptions>,
): Readonly<NormalizedAccordionItemDataGridComponentOptions> {
  const normalized = NormalizeAccordionItemStandaloneComponentOptions(options)
  return Object.freeze({
    ...normalized,
    ...NormalizeDataGridAccordionItem(options, normalized.backend),
  });
}