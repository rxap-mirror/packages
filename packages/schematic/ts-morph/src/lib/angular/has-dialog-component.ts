import { Tree } from '@angular-devkit/schematics';
import { CoerceSuffix } from '@rxap/schematics-utilities';
import {
  HasComponent,
  HasComponentOptions,
} from './has-component';

export interface HasDialogComponentOptions extends Omit<HasComponentOptions, 'name'> {
  dialogName?: string;
  name?: string;
}

export function HasDialogComponent(
  host: Tree,
  options: HasDialogComponentOptions,
): boolean {
  let {
    dialogName,
    name,
    project,
    feature,
    directory,
  } = options;
  dialogName ??= CoerceSuffix(name, '-dialog');
  return HasComponent(host, {
    project,
    feature,
    name: dialogName,
    directory,
  });
}
