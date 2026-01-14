import { noop } from '@angular-devkit/schematics';
import { BackendTypes } from '@rxap/schematic-angular';
import { NormalizedAccordionItemTreeTableComponentOptions } from '../normalize-accordion-item-tree-table-component-options';
import { nestjsBackendRule } from './nestjs-backend-rule';

export function backendRule(normalizedOptions: NormalizedAccordionItemTreeTableComponentOptions) {

  const { backend } = normalizedOptions;

  switch (backend.kind) {

    case BackendTypes.NESTJS:
      return nestjsBackendRule(normalizedOptions);

  }

  return noop();

}