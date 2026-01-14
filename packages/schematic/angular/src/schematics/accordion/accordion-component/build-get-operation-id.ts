import { buildOperationId } from '@rxap/schematics-ts-morph';
import { NormalizedAccordionComponentOptions } from './normalize-accordion-component-options';

export function buildGetOperationId(normalizedOptions: NormalizedAccordionComponentOptions) {
  const {
    controllerName,
    identifier,
  } = normalizedOptions;
  return buildOperationId(
    normalizedOptions,
    identifier ? 'getById' : 'get',
    controllerName,
  );
}