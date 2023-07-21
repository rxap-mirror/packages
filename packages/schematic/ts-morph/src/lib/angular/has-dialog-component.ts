import { Tree } from '@angular-devkit/schematics';
import { CoerceSuffix } from '@rxap/schematics-utilities';
import {
  HasComponent,
  HasComponentOptions,
} from './has-component';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface HasDialogComponentOptions extends HasComponentOptions {
}

export function HasDialogComponent(
  host: Tree,
  options: HasDialogComponentOptions,
): boolean {
  let {
    name,
    project,
    feature,
    directory,
  } = options;
  name ??= CoerceSuffix(name, '-dialog');
  return HasComponent(host, {
    project,
    feature,
    name: name,
    directory,
  });
}
