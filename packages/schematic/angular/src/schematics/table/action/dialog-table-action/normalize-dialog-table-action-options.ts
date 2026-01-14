import {
  AngularOptions,
  DialogTableAction,
  NormalizeAngularOptions,
  NormalizedAngularOptions,
  NormalizedDialogTableAction,
  NormalizeDialogTableAction,
} from '@rxap/schematic-angular';
import { Normalized } from '@rxap/utilities';
import { DialogTableActionOptions } from './schema';

export type NormalizedDialogTableActionOptions = Readonly<Normalized<Omit<DialogTableActionOptions, keyof DialogTableAction | keyof AngularOptions>> & NormalizedDialogTableAction & NormalizedAngularOptions>

export function NormalizeDialogTableActionOptions(
  options: DialogTableActionOptions,
): NormalizedDialogTableActionOptions {
  return Object.freeze({
    ...NormalizeAngularOptions(options),
    ...NormalizeDialogTableAction(options),
    tableName: options.tableName,
  });
}