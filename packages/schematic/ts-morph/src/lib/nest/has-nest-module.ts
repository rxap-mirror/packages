import {
  SchematicsException,
  Tree,
} from '@angular-devkit/schematics';
import { dasherize } from '@rxap/utilities';
import {
  GetProjectSourceRoot,
  HasProject,
} from '@rxap/workspace-utilities';
import { buildNestProjectName } from '@rxap/workspace-utilities';
import { join } from 'path';

export interface HasNestModuleOptions {
  project: string;
  feature?: string | null;
  shared?: boolean;
  name: string;
  backend: { project?: string | null, kind?: any } | undefined;
}

export function HasNestModule(host: Tree, options: HasNestModuleOptions) {
  const projectName = buildNestProjectName(options);
  const name = dasherize(options.name);
  if (!HasProject(host, projectName)) {
    throw new SchematicsException(`The nest module '${ name }' does not exists. The project '${ projectName }' does not exists`);
  }
  const projectSourceRoot = GetProjectSourceRoot(host, projectName);
  return host.exists(join(projectSourceRoot, `${ name }/${ name }.module.ts`));
}
