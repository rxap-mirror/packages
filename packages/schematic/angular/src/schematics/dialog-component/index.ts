import { chain } from '@angular-devkit/schematics';
import { CoerceDialogComponentRule } from '@rxap/schematics-ts-morph';
import { PrintAngularOptions } from '../../lib/print-angular-options';
import {
  NormalizedDialogComponentOptions,
  normalizeDialogComponentOptions,
} from './normalize-dialog-component-options';
import { DialogComponentOptions } from './schema';

function printDialogComponentOptions(options: NormalizedDialogComponentOptions) {
  PrintAngularOptions('dialog-component', options);
}

export default function (options: DialogComponentOptions) {
  const normalizedOptions = normalizeDialogComponentOptions(options);
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
