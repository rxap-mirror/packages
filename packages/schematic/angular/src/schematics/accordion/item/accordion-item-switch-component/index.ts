import {
  chain,
  noop,
} from '@angular-devkit/schematics';
import { ExecuteSchematic } from '@rxap/schematics-utilities';
import { Normalized } from '@rxap/utilities';
import {
  NormalizedBaseAccordionItem,
  NormalizedSwitchAccordionItem,
  NormalizeSwitchAccordionItem,
} from '../../../../lib/accordion-item';
import { AccordionItemKinds } from '../../../../lib/accordion-itme-kinds';
import {
  NormalizedAngularOptions,
  PrintAngularOptions,
} from '../../../../lib/angular-options';
import {
  NormalizeAccordionItemStandaloneComponentOptions,
  NormalizedAccordionItemStandaloneComponentOptions,
} from '../../accordion-item-component';
import { AccordionItemSwitchComponentOptions } from './schema';

export interface NormalizedAccordionItemSwitchComponentOptions
  extends Omit<Readonly<Normalized<AccordionItemSwitchComponentOptions> & NormalizedAngularOptions & NormalizedAccordionItemStandaloneComponentOptions>, 'switch' | 'importList'>, Omit<NormalizedSwitchAccordionItem, 'kind'> {
}

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
  PrintAngularOptions('accordion-item-switch-component', options);
}

function caseRule(
  normalizedOptions: NormalizedAccordionItemSwitchComponentOptions,
  item: NormalizedBaseAccordionItem
) {

  const {
    project,
    feature,
    backend,
    accordionName,
    overwrite,
    directory,
    nestModule,
  } = normalizedOptions;

  if (!directory) {
    throw new Error('The directory option is not defined! Ensure the accordion item switch component normalizer is correct!');
  }

  return chain([
    () => console.log(`Create accordion switch item component '${ item.name }' ...`),
    ExecuteSchematic('accordion-item-component', {
      ...item,
      nestModule,
      name: item.name,
      kind: item.kind,
      modifiers: item.modifiers,
      project,
      feature,
      accordionName,
      overwrite: overwrite || item.modifiers.includes('overwrite'),
      backend,
    }),
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
