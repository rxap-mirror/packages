import {
  NormalizeAngularOptions,
  NormalizedAngularOptions,
  NormalizedFormArray,
  NormalizeFormArray,
} from '@rxap/schematic-angular';
import {
  dasherize,
  NonNullableSelected,
  Normalized,
} from '@rxap/utilities';
import { FormArrayOptions } from './schema';

export type NormalizedFormArrayOptions = Readonly<Normalized<Pick<FormArrayOptions, 'formName'>>>
  & NonNullableSelected<NormalizedAngularOptions, 'controllerName'> & NormalizedFormArray;

export function NormalizeFormArrayOptions(
  options: Readonly<FormArrayOptions>,
): NormalizedFormArrayOptions {
  const normalizedAngularOptions = NormalizeAngularOptions(options);
  const normalizedFormDefinitionControl = NormalizeFormArray(options, normalizedAngularOptions.backend);
  const formName = dasherize(options.formName);
  const controllerName = options.controllerName ?? formName;
  return Object.freeze({
    ...normalizedAngularOptions,
    ...normalizedFormDefinitionControl,
    formName,
    controllerName,
    context: options.context ? dasherize(options.context) : null,
  });
}