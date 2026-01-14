import { strings } from '@angular-devkit/core';
import { chain } from '@angular-devkit/schematics';
import {
  CoerceAccordionItemTableComponentRule,
  GetItemOptions,
} from '@rxap/schematic-angular';
import { NormalizedAccordionItemTableComponentOptions } from './normalize-accordion-item-table-component-options';

export function componentRule(normalizedOptions: NormalizedAccordionItemTableComponentOptions) {
  const {
    componentName,
    project,
    feature,
    directory,
    shared,
    overwrite,
  } = normalizedOptions;
  const templateOptions = {
    ...strings,
    ...normalizedOptions,
    ...GetItemOptions(normalizedOptions),
  };
  return chain([
    () => console.log(`Coerce accordion item component ...`),
    CoerceAccordionItemTableComponentRule({
      accordionItem: normalizedOptions,
      name: componentName,
      project,
      feature,
      directory,
      shared,
      overwrite,
      template: {
        options: templateOptions,
      },
    }),
  ]);
}