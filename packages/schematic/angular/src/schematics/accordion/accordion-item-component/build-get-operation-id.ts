import { buildOperationId } from '@rxap/schematics-ts-morph';
import { BuildNestControllerName } from '@rxap/workspace-utilities';
import { NormalizedAccordionItemComponentOptions } from './normalize-accordion-item-standalone-component-options';

export function buildGetOperationId(normalizedOptions: NormalizedAccordionItemComponentOptions) {
  const {
    identifier,
  } = normalizedOptions;
  return buildOperationId(
    normalizedOptions,
    identifier ? 'getById' : 'get',
    BuildNestControllerName(normalizedOptions),
  );
}