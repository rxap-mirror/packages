import { buildOperationId } from '@rxap/schematics-ts-morph';
import { NormalizedFormComponentOptions } from './normalize-form-component-options';

export function getSubmitOperationId(normalizedOptions: NormalizedFormComponentOptions): string {
  const {
    project,
    feature,
    shared,
    controllerName,
    identifier,
    backend,
  } = normalizedOptions;
  return buildOperationId(
    {
      project,
      feature,
      shared,
      backend,
    },
    identifier ? 'submitById' : 'submit',
    controllerName,
  );
}