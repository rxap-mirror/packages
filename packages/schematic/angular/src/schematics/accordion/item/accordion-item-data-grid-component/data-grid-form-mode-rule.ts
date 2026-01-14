import { chain } from '@angular-devkit/schematics';
import { CoerceFormComponentProviderRule } from '@rxap/schematics-ts-morph';
import { CoerceSuffix } from '@rxap/schematics-utilities';
import { join } from 'path';
import { NormalizedAccordionItemDataGridComponentOptions } from './normalize-accordion-item-data-grid-component-options';

export function dataGridFormModeRule(normalizedOptions: NormalizedAccordionItemDataGridComponentOptions) {

  const {
    name,
    directory,
    project,
    feature,
  } = normalizedOptions;

  return chain([
    () => console.log(`Extend the form component providers ...`),
    CoerceFormComponentProviderRule({
      project,
      feature,
      directory: join(
        directory ?? '',
        CoerceSuffix(name, '-data-grid'),
      ),
      providerObject: {
        provide: 'RXAP_FORM_CONTEXT',
        useFactory: 'FormContextFromActivatedRouteFactory',
        deps: [ 'ActivatedRoute' ],
      },
      importStructures: [
        {
          namedImports: [ 'FormContextFromActivatedRouteFactory' ],
          moduleSpecifier: '@rxap/form-system',
        },
        {
          namedImports: [ 'ActivatedRoute' ],
          moduleSpecifier: '@angular/router',
        },
        {
          namedImports: [ 'RXAP_FORM_CONTEXT' ],
          moduleSpecifier: '@rxap/forms',
        },
      ],
    }),
  ]);

}