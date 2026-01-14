import { noop } from '@angular-devkit/schematics';
import { BackendTypes } from '@rxap/schematic-angular';
import { NormalizedAccordionItemComponentOptions } from '../normalize-accordion-item-standalone-component-options';
import { panelItemLocalDataSourceRule } from './panel-item-local-data-source-rule';
import { panelItemOpenApiDataSourceRule } from './panel-item-open-api-data-source-rule';

export function panelItemBackendRule(normalizedOptions: NormalizedAccordionItemComponentOptions) {

  const {
    backend,
  } = normalizedOptions;

  switch (backend.kind) {

    case BackendTypes.NESTJS:
      return panelItemOpenApiDataSourceRule(normalizedOptions);
    case BackendTypes.LOCAL:
      return panelItemLocalDataSourceRule(normalizedOptions);

  }

  return noop();

}