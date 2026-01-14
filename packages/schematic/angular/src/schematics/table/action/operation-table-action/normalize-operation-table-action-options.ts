import {
  AngularOptions,
  NormalizeAngularOptions,
  NormalizedAngularOptions,
  NormalizedOperationTableAction,
  NormalizeOperationTableAction,
  OperationTableAction,
} from '@rxap/schematic-angular';
import {
  CoerceSuffix,
  Normalized,
} from '@rxap/utilities';
import { BuildNestControllerName } from '@rxap/workspace-utilities';
import { OperationTableActionOptions } from './schema';

export interface NormalizedOperationTableActionOptions
  extends Readonly<Normalized<Omit<OperationTableActionOptions, keyof OperationTableAction | keyof AngularOptions>> & NormalizedOperationTableAction & NormalizedAngularOptions> {
  controllerName: string;
}

export function NormalizeOperationTableActionOptions(
  options: OperationTableActionOptions,
): NormalizedOperationTableActionOptions {
  const normalizedOptions = NormalizeAngularOptions(options);
  const tableActionOptions = NormalizeOperationTableAction(options);
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
  return Object.freeze({
    ...normalizedOptions,
    ...tableActionOptions,
    controllerName,
    tableName,
  });
}