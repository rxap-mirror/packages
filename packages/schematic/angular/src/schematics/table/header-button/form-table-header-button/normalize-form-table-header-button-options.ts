import {
  AngularOptions,
  FormHeaderButton,
  NormalizeAngularOptions,
  NormalizedAngularOptions,
  NormalizedFormHeaderButton,
  NormalizeFormHeaderButton,
} from '@rxap/schematic-angular';
import { BuildNestControllerName } from '@rxap/schematics-ts-morph';
import {
  CoerceSuffix,
  dasherize,
  Normalized,
} from '@rxap/utilities';
import { FormTableHeaderButtonOptions } from './schema';

export type NormalizedFormTableHeaderButtonOptions =
  Readonly<Normalized<Omit<FormTableHeaderButtonOptions, keyof AngularOptions | keyof FormHeaderButton>> & NormalizedAngularOptions & NormalizedFormHeaderButton>
  & {
  controllerName: string;
}

export function NormalizeFormTableHeaderButtonOptions(
  options: Readonly<FormTableHeaderButtonOptions>,
): NormalizedFormTableHeaderButtonOptions {
  const normalizedAngularOptions = NormalizeAngularOptions(options);
  const normalizedTableHeaderButton = NormalizeFormHeaderButton(options, options.tableName);
  if (!normalizedTableHeaderButton) {
    throw new Error('FATAL: should never happen');
  }
  const {
    nestModule,
    controllerName,
  } = normalizedAngularOptions;
  const tableName = CoerceSuffix(dasherize(options.tableName), '-table');
  return Object.freeze({
    ...normalizedAngularOptions,
    ...normalizedTableHeaderButton,
    tableName,
    controllerName: controllerName ?? BuildNestControllerName({
      nestModule,
      controllerName,
      controllerNameSuffix: 'header-button',
    }),
  });
}