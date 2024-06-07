import { chain } from '@angular-devkit/schematics';
import { BuildNestControllerName } from '@rxap/schematics-ts-morph';
import { ExecuteSchematic } from '@rxap/schematics-utilities';
import {
  CoerceSuffix,
  Normalized,
} from '@rxap/utilities';
import {
  NestedAccordionItem,
  NormalizedNestedAccordionItem,
  NormalizeNestedAccordionItem,
} from '../../../../lib/accordion/item/nested-accordion-item';
import {
  AngularOptions,
  NormalizedAngularOptions,
} from '../../../../lib/angular-options';
import {
  NormalizeAccordionItemStandaloneComponentOptions,
  printAccordionItemComponentOptions,
} from '../../accordion-item-component';
import { AccordionItemNestedComponentOptions } from './schema';

export interface NormalizedAccordionItemNestedComponentOptions extends Readonly<Normalized<Omit<AccordionItemNestedComponentOptions, keyof AngularOptions | keyof NestedAccordionItem>> & NormalizedAngularOptions & NormalizedNestedAccordionItem> {
  controllerName: string;
  componentName: string;
  directory: string;
  nestModule: string;
}

export function NormalizeAccordionItemNestedComponentOptions(
  options: Readonly<AccordionItemNestedComponentOptions>,
): Readonly<NormalizedAccordionItemNestedComponentOptions> {
  return Object.freeze({
    ...NormalizeAccordionItemStandaloneComponentOptions(options),
    ...NormalizeNestedAccordionItem(options),
  });
}

function printOptions(options: NormalizedAccordionItemNestedComponentOptions) {
  printAccordionItemComponentOptions(options, 'accordion-item-nested-component');
}

function accordionComponentRule(normalizedOptions: NormalizedAccordionItemNestedComponentOptions) {

  const {
    backend,
    directory,
    accordion,
    nestModule,
    name,
    project,
    feature,
    context,
    overwrite,
    replace,
    controllerName,
  } = normalizedOptions;

  return ExecuteSchematic('accordion-component', {
    backend,
    ...accordion,
    directory: directory?.replace(/\/(\w+)-panel/, '/' + CoerceSuffix(name, '-accordion')),
    nestModule,
    project,
    feature,
    context,
    overwrite,
    replace,
    controllerName: BuildNestControllerName({
      controllerName,
      nestModule,
      controllerNameSuffix: name,
    }),
  });
}

export default function (options: AccordionItemNestedComponentOptions) {
  const normalizedOptions = NormalizeAccordionItemNestedComponentOptions(options);
  printOptions(normalizedOptions);
  return () => {
    return chain([
      accordionComponentRule(normalizedOptions),
    ]);
  };
}
