import { Tree } from '@angular-devkit/schematics';
import {
  GetProjectSourceRoot,
  GetProjectType,
} from '@rxap/workspace-utilities';
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
  let infix = '';
  if (type === 'library') {
    if (!directory.startsWith('lib/')) {
      infix = 'lib';
    }
  }
  if (type === 'application' && !feature && !directory.startsWith('app/')) {
    infix = 'app';
  }
  let basePath: string;
  if (feature) {
    basePath = join(projectSourceRoot, infix, 'feature', feature, directory);
  } else {
    basePath = join(projectSourceRoot, infix, directory);
  }
  return basePath;
}
