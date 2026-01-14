import { strings } from '@angular-devkit/core';
import { chain } from '@angular-devkit/schematics';
import {
  CoerceAccordionItemTableComponentRule,
  GetItemOptions,
} from '@rxap/schematic-angular';
import { NormalizedAccordionItemTreeTableComponentOptions } from './normalize-accordion-item-tree-table-component-options';

export function componentRule(normalizedOptions: NormalizedAccordionItemTreeTableComponentOptions) {
  const {
    componentName,
    project,
    feature,
    directory,
    shared,
    overwrite,
    name,
  } = normalizedOptions;
  const templateOptions = {
    ...strings,
    ...normalizedOptions,
    name,
    ...GetItemOptions(normalizedOptions),
  };
  return chain([
    () => console.log(`Coerce accordion item component ...`),
    CoerceAccordionItemTableComponentRule({
      accordionItem: normalizedOptions,
      tableComponentSuffix: 'tree-table',
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