import {
  chain,
  noop,
} from '@angular-devkit/schematics';
import { ExecuteSchematic } from '@rxap/schematics-utilities';
import {
  DeleteEmptyProperties,
  Normalized,
} from '@rxap/utilities';
import { NormalizedAccordionItem } from '../../../../lib/accordion/accordion-item';
import {
  NormalizedNestedAccordionItem,
  NormalizeNestedAccordionItem,
  NestedAccordionItem,
} from '../../../../lib/accordion/item/nested-accordion-item';
import { AccordionItemKinds } from '../../../../lib/accordion/accordion-item-kind';
import {
  AngularOptions,
  NormalizedAngularOptions,
} from '../../../../lib/angular-options';
import {
  NormalizeAccordionItemStandaloneComponentOptions,
  NormalizedAccordionItemComponentOptions,
  printAccordionItemComponentOptions,
} from '../../accordion-item-component';
import { AccordionItemComponentOptions } from '../../accordion-item-component/schema';
import { AccordionItemNestedComponentOptions } from './schema';

export type NormalizedAccordionItemNestedComponentOptions = Readonly<Normalized<Omit<AccordionItemNestedComponentOptions, keyof AngularOptions | keyof NestedAccordionItem | keyof AccordionItemComponentOptions>> & NormalizedAngularOptions & NormalizedNestedAccordionItem & NormalizedAccordionItemComponentOptions>

export function NormalizeAccordionItemNestedComponentOptions(
  options: Readonly<AccordionItemNestedComponentOptions>,
): Readonly<NormalizedAccordionItemNestedComponentOptions> {
  const normalizedAccordionItemComponentOptions = NormalizeAccordionItemStandaloneComponentOptions(options);
  return Object.freeze({
    ...normalizedAccordionItemComponentOptions,
    ...NormalizeNestedAccordionItem({
      ...options,
      kind: AccordionItemKinds.Nested,
    }),
  });
}

function printOptions(options: NormalizedAccordionItemNestedComponentOptions) {
  printAccordionItemComponentOptions(options, 'accordion-item-nested-component');
}

function accordionComponentRule(normalizedOptions: NormalizedAccordionItemNestedComponentOptions) {

  const {
    itemList,
    name,
    backend,
  } = normalizedOptions;

  return ExecuteSchematic('accordion-component', {
    name,
    itemList,
    backend,
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
