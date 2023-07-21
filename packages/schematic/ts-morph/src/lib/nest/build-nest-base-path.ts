import { Tree } from '@angular-devkit/schematics';
import { GetProjectSourceRoot } from '@rxap/schematics-utilities';
import { join } from 'path';
import { buildNestProjectName } from './project-utilities';

export interface BuildNestBasePathOptions {
  project: string;
  feature?: string | null;
  directory?: string | null;
  shared?: boolean;
}

export function BuildNestBasePath(host: Tree, options: BuildNestBasePathOptions): string {
  let { directory } = options;
  directory ??= '';
  // get the project source root after the coerce call.
  // else it is possible that GetProjectSourceRoot fails, bc the project does not yet exist.
  const projectName = buildNestProjectName(options);
  const projectSourceRoot = GetProjectSourceRoot(host, projectName);
  return join(projectSourceRoot, directory);
}
