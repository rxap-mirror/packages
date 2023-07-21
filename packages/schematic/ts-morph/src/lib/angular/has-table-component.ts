import { Tree } from '@angular-devkit/schematics';
import {
  HasComponent,
  HasComponentOptions,
} from './has-component';
import { BuildAngularBasePath } from './build-angular-base-path';
import { join } from 'path';
import { CoerceSuffix } from '@rxap/utilities';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface HasTableComponentOptions extends HasComponentOptions {}

export function HasTableComponent(host: Tree, options: HasTableComponentOptions) {
  let { name } = options;
  name = CoerceSuffix(name, '-table');
  if (!HasComponent(host, options)) {
    return false;
  }

  let basePath = BuildAngularBasePath(host, options);
  if (!basePath.endsWith(name)) {
    basePath = join(basePath, name);
  }
  const fullPath = join(basePath, name + '.ts');
  return host.exists(fullPath);
}
