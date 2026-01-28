import {
  AngularOptions,
  NormalizedAngularOptions,
  NormalizedSwitchAccordionItem,
  NormalizeSwitchAccordionItem,
  SwitchAccordionItem,
} from '@rxap/schematic-angular';
import { Normalized } from '@rxap/utilities';
import { NormalizeAccordionItemStandaloneComponentOptions } from '../../accordion-item-component/normalize-accordion-item-standalone-component-options';
import { AccordionItemSwitchComponentOptions } from './schema';

export interface NormalizedAccordionItemSwitchComponentOptions
  extends Readonly<Normalized<Omit<AccordionItemSwitchComponentOptions, keyof AngularOptions | keyof SwitchAccordionItem>> & NormalizedAngularOptions & NormalizedSwitchAccordionItem> {
  controllerName: string;
  componentName: string;
  directory: string;
  nestModule: string;
}

export function NormalizeAccordionItemSwitchComponentOptions(
  options: Readonly<AccordionItemSwitchComponentOptions>,
): Readonly<NormalizedAccordionItemSwitchComponentOptions> {
  const normalized = NormalizeAccordionItemStandaloneComponentOptions(options);
  return Object.freeze({
    ...normalized,
    ...NormalizeSwitchAccordionItem(options, normalized.backend),
  });
}