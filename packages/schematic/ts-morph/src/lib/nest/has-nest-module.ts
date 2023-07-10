import {
  SchematicsException,
  Tree,
} from '@angular-devkit/schematics';
import {
  dasherize,
  GetProjectSourceRoot,
  HasProject,
} from '@rxap/schematics-utilities';
import { join } from 'path';
import { buildNestProjectName } from './project-utilities';

export interface HasNestModuleOptions {
  project: string;
  feature?: string;
  shared?: boolean;
  name: string;
}

export function HasNestModule(host: Tree, options: HasNestModuleOptions) {
  const projectName = buildNestProjectName(options);
  const name = dasherize(options.name);
  if (!HasProject(host, projectName)) {
    throw new SchematicsException(`The nest module '${name}' does not exists. The project '${projectName}' does not exists`);
  }
  const projectSourceRoot = GetProjectSourceRoot(host, projectName);
  return host.exists(join(projectSourceRoot, `${name}/${name}.module.ts`));
}
