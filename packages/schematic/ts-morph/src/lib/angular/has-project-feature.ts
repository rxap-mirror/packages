import {SchematicsException, Tree} from '@angular-devkit/schematics';
import {GetProjectSourceRoot, HasProject} from '@rxap/schematics-utilities';
import {join} from 'path';

export function HasProjectFeature(host: Tree, {project, feature}: { project: string, feature: string }) {
  if (!HasProject(host, project)) {
    throw new SchematicsException(`The feature '${feature}' does not exists. The project '${project}' does not exists.`);
  }
  const projectSourceRoot = GetProjectSourceRoot(host, project);
  return host.exists(join(projectSourceRoot, `feature/${feature}/index.ts`));
}
