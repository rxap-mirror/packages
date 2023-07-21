import {
  SchematicsException,
  Tree,
} from '@angular-devkit/schematics';
import {
  GetProjectSourceRoot,
  HasProject,
} from '@rxap/schematics-utilities';
import { join } from 'path';

export interface HasProjectFeatureOptions {
  project: string;
  feature?: string | null;
}

export function HasProjectFeature(
  host: Tree,
  {
    project,
    feature,
  }: HasProjectFeatureOptions,
) {
  if (!feature) {
    throw new SchematicsException(`The feature option is not set. Can not determine if the project '${ project }' has the feature.`);
  }
  if (!HasProject(host, project)) {
    throw new SchematicsException(`The feature '${ feature }' does not exists. The project '${ project }' does not exists.`);
  }
  const projectSourceRoot = GetProjectSourceRoot(host, project);
  return host.exists(join(projectSourceRoot, `feature/${ feature }/index.ts`)) ||
    host.exists(join(projectSourceRoot, `feature/${ feature }/routes.ts`));
}
