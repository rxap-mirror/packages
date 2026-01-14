import {
  AngularOptions,
  NormalizeAngularOptions,
  NormalizedAngularOptions,
  NormalizedDialogAction,
  NormalizeDialogActionList,
  ToTitle,
} from '@rxap/schematic-angular';
import {
  CoerceSuffix,
  dasherize,
} from '@rxap/schematics-utilities';
import { Normalized } from '@rxap/utilities';
import { join } from 'path';
import { DialogComponentOptions } from './schema';

export interface NormalizedDialogComponentOptions
  extends Readonly<Normalized<Omit<DialogComponentOptions, keyof AngularOptions | 'actionList'>> & NormalizedAngularOptions> {
  actionList: ReadonlyArray<NormalizedDialogAction>;
}

export function normalizeDialogComponentOptions(
  options: Readonly<DialogComponentOptions>,
): Readonly<NormalizedDialogComponentOptions> {
  const normalizedAngularOptions = NormalizeAngularOptions(options);
  const { directory } = normalizedAngularOptions;
  const dialogName = CoerceSuffix(dasherize(options.dialogName), '-dialog');
  const title = options.title ?? ToTitle(dialogName);
  return Object.freeze({
    ...normalizedAngularOptions,
    directory: join(directory ?? '', dialogName),
    dialogName,
    title,
    actionList: NormalizeDialogActionList(options.actionList),
  });
}