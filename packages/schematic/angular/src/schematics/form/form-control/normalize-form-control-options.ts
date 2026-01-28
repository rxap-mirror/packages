import {
  AngularOptions,
  NormalizeAngularOptions,
  NormalizedAngularOptions,
  NormalizedFormControl,
  NormalizeFormControl,
} from '@rxap/schematic-angular';
import { dasherize } from '@rxap/schematics-utilities';
import {
  NonNullableSelected,
  Normalized,
} from '@rxap/utilities';
import { FormControlOptions } from './schema';

export type NormalizedFormControlOptions = NonNullableSelected<Readonly<Normalized<Omit<FormControlOptions, keyof AngularOptions>>> & NormalizedAngularOptions & NormalizedFormControl, 'controllerName'>;

export function NormalizeFormControlOptions(
  options: Readonly<FormControlOptions>,
): NormalizedFormControlOptions {
  const normalizedAngularOptions = NormalizeAngularOptions(options);
  const normalizedFormDefinitionControl = NormalizeFormControl(options, normalizedAngularOptions.backend);
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