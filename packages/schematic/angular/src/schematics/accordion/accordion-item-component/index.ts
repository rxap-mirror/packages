import { chain } from '@angular-devkit/schematics';
import { NormalizedAccordionItem } from '../../../lib/accordion/accordion-item';
import { NormalizedAngularOptions } from '../../../lib/angular-options';
import { PrintAngularOptions } from '../../../lib/print-angular-options';
import { itemRule } from './item-rule';
import { NormalizeAccordionItemComponentOptions } from './normalize-accordion-item-standalone-component-options';
import { AccordionItemComponentOptions } from './schema';

export function printAccordionItemComponentOptions(options: NormalizedAngularOptions & Pick<NormalizedAccordionItem, 'kind' | 'identifier'>, schematicName = 'accordion-item-component') {
  PrintAngularOptions(schematicName, options);
  console.log('===== Kind:'.blue, options.kind);
  console.log('===== Identifier:'.blue, options.identifier?.property?.name ?? 'NONE'.red);
}

export default function (options: AccordionItemComponentOptions) {
  const normalizedOptions = NormalizeAccordionItemComponentOptions(options);

  printAccordionItemComponentOptions(normalizedOptions);
  return () => {
    return chain([
      // componentRule(normalizedOptions),
      itemRule(normalizedOptions),
    ]);
  };
}
