import { Tree } from '@angular-devkit/schematics';
import {
  GetProjectSourceRoot,
  GetProjectType,
} from '@rxap/schematics-utilities';
import { join } from 'path';

export interface BuildAngularBasePathOptions {
  project: string;
  feature?: string | null;
  shared?: boolean;
  directory?: string | null;
}

export function BuildAngularBasePath(host: Tree, options: Readonly<BuildAngularBasePathOptions>): string {
  let {
    project,
    feature,
    directory,
    shared,
  } = options;
  directory ??= '';
  project = shared ? 'shared' : project;
  const projectSourceRoot = GetProjectSourceRoot(host, project);
  const type = GetProjectType(host, project);
  if (feature) {
    return join(projectSourceRoot, type === 'library' ? 'lib' : '', 'feature', feature, directory);
  } else {
    return join(projectSourceRoot, type === 'library' ? 'lib' : '', 'app', directory);
  }
}
