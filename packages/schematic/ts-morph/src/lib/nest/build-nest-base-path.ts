import { Tree } from '@angular-devkit/schematics';
import { GetProjectSourceRoot } from '@rxap/schematics-utilities';
import { buildNestProjectName } from '@rxap/workspace-utilities';
import { join } from 'path';

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
