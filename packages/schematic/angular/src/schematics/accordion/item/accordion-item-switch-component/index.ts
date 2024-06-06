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
  NormalizedSwitchAccordionItem,
  NormalizeSwitchAccordionItem,
  SwitchAccordionItem,
} from '../../../../lib/accordion/item/switch-accordion-item';
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
import { AccordionItemSwitchComponentOptions } from './schema';

export type NormalizedAccordionItemSwitchComponentOptions = Readonly<Normalized<Omit<AccordionItemSwitchComponentOptions, keyof AngularOptions | keyof SwitchAccordionItem | keyof AccordionItemComponentOptions>> & NormalizedAngularOptions & NormalizedSwitchAccordionItem & NormalizedAccordionItemComponentOptions>

export function NormalizeAccordionItemSwitchComponentOptions(
  options: Readonly<AccordionItemSwitchComponentOptions>,
): Readonly<NormalizedAccordionItemSwitchComponentOptions> {
  const normalizedAccordionItemComponentOptions = NormalizeAccordionItemStandaloneComponentOptions(options);
  return Object.freeze({
    ...normalizedAccordionItemComponentOptions,
    ...NormalizeSwitchAccordionItem({
      ...options,
      kind: AccordionItemKinds.Switch,
    }),
  });
}

function printOptions(options: NormalizedAccordionItemSwitchComponentOptions) {
  printAccordionItemComponentOptions(options, 'accordion-item-switch-component');
}

function caseRule(
  normalizedOptions: NormalizedAccordionItemSwitchComponentOptions,
  item: NormalizedAccordionItem
) {

  const {
    overwrite,
    directory,
    project,
    feature,
    replace,
    nestModule,
    backend,
    accordionName,
    shared,
    prefix,
    identifier,
  } = normalizedOptions;

  if (!directory) {
    throw new Error('The directory option is not defined! Ensure the accordion item switch component normalizer is correct!');
  }

  const itemOptions = {
    ...DeleteEmptyProperties({ ...item }),
    project,
    feature,
    replace,
    nestModule,
    backend,
    accordionName,
    shared,
    prefix,
    identifier,
    overwrite: overwrite || item.modifiers.includes('overwrite'),
  };

  console.log('itemOptions', itemOptions);

  return chain([
    () => console.log(`Create accordion switch item component '${ item.name }' ...`),
    ExecuteSchematic('accordion-item-component', itemOptions),
  ]);

}

function caseListRule(normalizedOptions: NormalizedAccordionItemSwitchComponentOptions) {
  const { switch: { case: caseList } } = normalizedOptions;
  return chain(caseList.map((item) => {
    return chain(item.itemList.map((item) => caseRule(normalizedOptions, item)));
  }));
}

function defaultCaseRule(normalizedOptions: NormalizedAccordionItemSwitchComponentOptions) {
  const { switch: { defaultCase } } = normalizedOptions;
  if (defaultCase) {
    return chain(defaultCase.itemList.map((item) => caseRule(normalizedOptions, item)));
  }
  return noop();
}

export default function (options: AccordionItemSwitchComponentOptions) {
  const normalizedOptions = NormalizeAccordionItemSwitchComponentOptions(options);
  printOptions(normalizedOptions);
  return () => {
    return chain([
      caseListRule(normalizedOptions),
      defaultCaseRule(normalizedOptions),
    ]);
  };
}
