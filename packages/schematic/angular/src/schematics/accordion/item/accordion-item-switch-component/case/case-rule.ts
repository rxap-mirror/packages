import {
  chain,
  noop,
} from '@angular-devkit/schematics';
import { NormalizedAccordionItem } from '@rxap/schematic-angular';
import { ExecuteSchematic } from '@rxap/schematics-utilities';
import { DeleteEmptyProperties } from '@rxap/utilities';
import { NormalizedAccordionItemSwitchComponentOptions } from '../normalize-accordion-item-switch-component-options';

function caseRule(
  normalizedOptions: NormalizedAccordionItemSwitchComponentOptions,
  item: NormalizedAccordionItem,
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
    throw new Error(
      'The directory option is not defined! Ensure the accordion item switch component normalizer is correct!');
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

export function caseListRule(normalizedOptions: NormalizedAccordionItemSwitchComponentOptions) {
  const { switch: { case: caseList } } = normalizedOptions;
  return chain(caseList.map((item) => {
    return chain(item.itemList.map((item) => caseRule(normalizedOptions, item)));
  }));
}

export function defaultCaseRule(normalizedOptions: NormalizedAccordionItemSwitchComponentOptions) {
  const { switch: { defaultCase } } = normalizedOptions;
  if (defaultCase) {
    return chain(defaultCase.itemList.map((item) => caseRule(normalizedOptions, item)));
  }
  return noop();
}