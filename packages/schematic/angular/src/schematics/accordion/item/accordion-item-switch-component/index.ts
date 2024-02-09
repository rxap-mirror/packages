import {
  chain,
  noop,
} from '@angular-devkit/schematics';
import { ExecuteSchematic } from '@rxap/schematics-utilities';
import {
  dasherize,
  Normalized,
} from '@rxap/utilities';
import { join } from 'path';
import {
  AccordionItem,
  NormalizeAccordionItemList,
  NormalizedAccordionItem,
} from '../../../../lib/accordion-item';
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
  extends Omit<Readonly<Normalized<AccordionItemSwitchComponentOptions> & NormalizedAngularOptions & NormalizedAccordionItemStandaloneComponentOptions>, 'switch'> {
  switch: Readonly<{
    property: Readonly<{
      path: string;
      type: string;
    }>;
    case: ReadonlyArray<{
      test: string;
      itemList: ReadonlyArray<NormalizedAccordionItem>
    }>;
    defaultCase: Readonly<{
      itemList: ReadonlyArray<NormalizedAccordionItem>
    }> | null;
  }>;
}

export function NormalizeAccordionItemSwitchComponentOptions(
  options: Readonly<AccordionItemSwitchComponentOptions>,
): Readonly<NormalizedAccordionItemSwitchComponentOptions> {
  const normalizedAccordionItemComponentOptions = NormalizeAccordionItemStandaloneComponentOptions(options);
  const { itemName } = normalizedAccordionItemComponentOptions;
  const { switch: switchOptions } = options;
  const { property, case: caseList, defaultCase } = switchOptions;
  return Object.freeze({
    ...normalizedAccordionItemComponentOptions,
    switch: Object.freeze({
      property: Object.freeze({
        path: property.path,
        type: property.type ?? 'string',
      }),
      case: Object.freeze(caseList.map((item) => ({
        test: item.test,
        itemList: NormalizeAccordionItemList(item.itemList.map((item) => ({
          ...item,
          name: [itemName, dasherize(item.name)].join('-'),
          type: item.type ?? 'panel',
        }) as AccordionItem)),
      }))),
      defaultCase: defaultCase ? {
        itemList: NormalizeAccordionItemList(defaultCase.itemList.map((item) => ({
          ...item,
          name: [itemName, dasherize(item.name)].join('-'),
          type: item.type ?? 'panel',
        }) as AccordionItem)),
      } : null,
    }),
  });
}

function printOptions(options: NormalizedAccordionItemSwitchComponentOptions) {
  PrintAngularOptions('accordion-item-switch-component', options);
}

function caseRule(
  normalizedOptions: NormalizedAccordionItemSwitchComponentOptions,
  item: NormalizedAccordionItem
) {

  const {
    project,
    feature,
    backend,
    accordionName,
    overwrite,
    directory,
    itemName,
  } = normalizedOptions;

  if (!directory) {
    throw new Error('The directory option is not defined! Ensure the accordion item switch component normalizer is correct!');
  }

  return chain([
    () => console.log(`Create accordion switch item component '${ item.name }' ...`),
    ExecuteSchematic('accordion-item-component', {
      ...item,
      itemName: item.name,
      type: item.type,
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
  const { switch: { case: caseList } } = normalizedOptions;
  return () => {
    return chain([
      caseListRule(normalizedOptions),
      defaultCaseRule(normalizedOptions),
    ]);
  };
}
