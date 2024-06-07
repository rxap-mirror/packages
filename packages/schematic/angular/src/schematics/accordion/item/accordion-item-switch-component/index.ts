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
import {
  AngularOptions,
  NormalizedAngularOptions,
} from '../../../../lib/angular-options';
import {
  NormalizeAccordionItemStandaloneComponentOptions,
  printAccordionItemComponentOptions,
} from '../../accordion-item-component';
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
  return Object.freeze({
    ...NormalizeAccordionItemStandaloneComponentOptions(options),
    ...NormalizeSwitchAccordionItem(options),
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
