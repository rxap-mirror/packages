import {SchematicsException, Tree} from '@angular-devkit/schematics';
import {GetProjectType, HasProject} from '@rxap/schematics-utilities';
import {HasProjectFeature} from './has-project-feature';
import {join} from 'path';
import {BuildAngularBasePath} from './build-angular-base-path';

export interface HasComponentOptions {
  project: string;
  feature: string;
  name: string;
  directory?: string;
}

export function HasComponent(host: Tree, options: Readonly<HasComponentOptions>): boolean {
  const {project, feature, name} = options;

  if (!HasProject(host, project)) {
    throw new SchematicsException(`The component '${name}' does not exists. The project '${project}' does not exists.`);
  }
  const type = GetProjectType(host, project);
  if (type !== 'library' && !HasProjectFeature(host, options)) {
    throw new SchematicsException(`The component '${name}' does not exists. The project '${project}' has not the feature '${feature}'.`);
  }
  let basePath = BuildAngularBasePath(host, options);
  if (!basePath.endsWith(name)) {
    basePath = join(basePath, name);
  }
  return host.exists(join(basePath,
    name +
    '.component.ts'));

}
