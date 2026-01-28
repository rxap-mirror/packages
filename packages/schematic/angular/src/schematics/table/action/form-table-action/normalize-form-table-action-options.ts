import {
  AngularOptions,
  FormTableAction,
  NormalizeAngularOptions,
  NormalizedAngularOptions,
  NormalizedFormTableAction,
  NormalizeFormTableAction,
} from '@rxap/schematic-angular';
import {
  CoerceSuffix,
  Normalized,
} from '@rxap/utilities';
import { BuildNestControllerName } from '@rxap/workspace-utilities';
import { FormTableActionOptions } from './schema';

export type NormalizedFormTableActionOptions = Readonly<Normalized<Omit<FormTableActionOptions, keyof FormTableAction | keyof AngularOptions>> & NormalizedFormTableAction & NormalizedAngularOptions>

export function NormalizeFormTableActionOptions(
  options: Readonly<FormTableActionOptions>,
): NormalizedFormTableActionOptions {
  const normalizedOptions = NormalizeAngularOptions(options);
  const tableActionOptions = NormalizeFormTableAction(options, normalizedOptions.backend);
  const { type } = tableActionOptions;
  let {
    controllerName,
    nestModule,
  } = normalizedOptions;
  const { tableName } = options;
  nestModule ??= tableName;
  controllerName ??= BuildNestControllerName({
    controllerName: CoerceSuffix(type, '-action'),
    nestModule,
  });
  return {
    ...normalizedOptions,
    ...tableActionOptions,
    tableName,
    controllerName,
  };
}