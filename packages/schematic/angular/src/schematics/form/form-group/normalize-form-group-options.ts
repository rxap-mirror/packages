import {
  NormalizeAngularOptions,
  NormalizedAngularOptions,
  NormalizedFormGroup,
  NormalizeFormGroup,
} from '@rxap/schematic-angular';
import {
  dasherize,
  NonNullableSelected,
  Normalized,
} from '@rxap/utilities';
import { FormGroupOptions } from './schema';

export type NormalizedFormGroupOptions = Readonly<Normalized<Pick<FormGroupOptions, 'formName'>>>
  & NonNullableSelected<NormalizedAngularOptions, 'controllerName'> & NormalizedFormGroup;

export function NormalizeFormGroupOptions(
  options: Readonly<FormGroupOptions>,
): NormalizedFormGroupOptions {
  const normalizedAngularOptions = NormalizeAngularOptions(options);
  const normalizedFormDefinitionControl = NormalizeFormGroup(options);
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