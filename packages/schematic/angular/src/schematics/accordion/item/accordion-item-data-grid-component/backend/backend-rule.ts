import { noop } from '@angular-devkit/schematics';
import { BackendTypes } from '@rxap/schematic-angular';
import { NormalizedAccordionItemDataGridComponentOptions } from '../normalize-accordion-item-data-grid-component-options';
import { nestjsBackendRule } from './nestjs-backend-rule';

export function backendRule(normalizedOptions: NormalizedAccordionItemDataGridComponentOptions) {

  const { backend } = normalizedOptions;

  switch (backend.kind) {

    case BackendTypes.NESTJS:
      return nestjsBackendRule(normalizedOptions);

  }

  return noop();

}