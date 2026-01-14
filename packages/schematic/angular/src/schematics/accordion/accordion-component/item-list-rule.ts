import { chain } from '@angular-devkit/schematics';
import { itemComponentRule } from './item-component-rule';
import { NormalizedAccordionComponentOptions } from './normalize-accordion-component-options';

export function itemListRule(normalizedOptions: NormalizedAccordionComponentOptions) {

  const {
    itemList,
  } = normalizedOptions;

  return chain([
    () => console.log('Create accordion item components ...'),
    ...itemList.map((item) => itemComponentRule(normalizedOptions, item)),
  ]);

}