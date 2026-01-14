import {
  chain,
  Tree,
} from '@angular-devkit/schematics';
import { PrintAngularOptions } from '../../../lib/print-angular-options';
import { backendRule } from './backend/backend-rule';
import { componentRule } from './component-rule';
import { hasMissingPanelComponents } from './has-missing-panel-components';
import { itemListRule } from './item-list-rule';
import {
  normalizeAccordionComponentOptions,
  NormalizedAccordionComponentOptions,
} from './normalize-accordion-component-options';
import { AccordionComponentOptions } from './schema';
import { storiesRule } from './stories-rule';

function printOptions(options: NormalizedAccordionComponentOptions) {
  PrintAngularOptions('accordion-component', options);
  if (options.itemList.length) {
    console.log(`=== items: \x1b[34m${ options.itemList.map((item) => item.name).join(', ') }\x1b[0m`);
  } else {
    console.log('=== items: \x1b[31mempty\x1b[0m');
  }
}

export default function (options: AccordionComponentOptions) {
  const normalizedOptions = normalizeAccordionComponentOptions(options);
  const {
    itemList,
  } = normalizedOptions;
  printOptions(normalizedOptions);
  return function (host: Tree) {
    const hasMissing = hasMissingPanelComponents(
      host,
      itemList.map((item) => item.name),
      normalizedOptions,
    );
    return chain([
      componentRule(normalizedOptions, hasMissing),
      storiesRule(normalizedOptions),
      backendRule(normalizedOptions),
      itemListRule(normalizedOptions),
    ]);
  };
}
