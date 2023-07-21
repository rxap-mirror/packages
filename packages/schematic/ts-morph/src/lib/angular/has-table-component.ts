import { Tree } from '@angular-devkit/schematics';
import { HasComponent } from './has-component';
import { BuildAngularBasePath } from './build-angular-base-path';
import { join } from 'path';

export interface HasComponentOptions {
  project: string;
  feature: string;
  name: string;
  directory?: string;
}

export function HasTableComponent(host: Tree, options: HasComponentOptions) {
  const { name } = options;
  if (!HasComponent(host, options)) {
    return false;
  }

  let basePath = BuildAngularBasePath(host, options);
  if (!basePath.endsWith(name)) {
    basePath = join(basePath, name);
  }
  return host.exists(join(basePath, name + '.ts'));
}
