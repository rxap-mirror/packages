import { DialogComponentOptions } from './schema';
import { chain } from '@angular-devkit/schematics';
import {
  CoerceSuffix,
  dasherize,
} from '@rxap/schematics-utilities';
import { join } from 'path';
import { CoerceDialogComponentRule } from '@rxap/schematics-ts-morph';
import {
  NormalizeAngularOptions,
  NormalizedAngularOptions,
  PrintAngularOptions,
} from '../../lib/angular-options';
import { Normalized } from '@rxap/utilities';
import { ToTitle } from '../../lib/to-title';
import {
  NormalizedDialogAction,
  NormalizeDialogActionList,
} from '../../lib/dialog-action';

interface NormalizedDialogComponentOptions
  extends Omit<Readonly<Normalized<DialogComponentOptions> & NormalizedAngularOptions>, 'actionList'> {
  actionList: NormalizedDialogAction[];
}

function NormalizeOptions(
  options: Readonly<DialogComponentOptions>,
): Readonly<NormalizedDialogComponentOptions> {
  const normalizedAngularOptions = NormalizeAngularOptions(options);
  const { directory } = normalizedAngularOptions;
  const dialogName = CoerceSuffix(dasherize(options.dialogName), '-dialog');
  const title = options.title ?? ToTitle(dialogName);
  return Object.seal({
    ...normalizedAngularOptions,
    directory: join(directory ?? '', dialogName),
    dialogName,
    title,
    actionList: NormalizeDialogActionList(options.actionList),
  });
}

function printDialogComponentOptions(options: NormalizedDialogComponentOptions) {
  PrintAngularOptions('dialog-component', options);
}

export default function (options: DialogComponentOptions) {
  const normalizedOptions = NormalizeOptions(options);
  const {
    overwrite,
    project,
    feature,
    dialogName,
    directory,
  } = normalizedOptions;
  printDialogComponentOptions(normalizedOptions);
  return function () {
    return chain([
      () => console.log('Coerce dialog component ...'),
      CoerceDialogComponentRule({
        project,
        dialogName,
        feature,
        directory,
        overwrite,
        template: {
          options: normalizedOptions,
        },
      }),
    ]);
  };
}
