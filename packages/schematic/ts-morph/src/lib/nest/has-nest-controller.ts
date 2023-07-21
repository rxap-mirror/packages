import {
  SchematicsException,
  Tree,
} from '@angular-devkit/schematics';
import {
  GetProjectSourceRoot,
  HasProject,
} from '@rxap/schematics-utilities';
import { buildNestProjectName } from './project-utilities';

export interface HasNestControllerOptions {
  project: string;
  feature?: string;
  shared?: boolean;
  name: string;
  nestModule: string;
}

export function HasNestController(host: Tree, options: HasNestControllerOptions) {
  const {
    name,
    nestModule,
  } = options;
  if (!HasProject(host, buildNestProjectName(options))) {
    throw new SchematicsException(`The nest controller ${ name } does not exists. The project ${ buildNestProjectName(
      options) } does not exist.`);
  }
  const projectSourceRoot = GetProjectSourceRoot(host, buildNestProjectName(options));
  return host.exists(`${ projectSourceRoot }/${ nestModule }/${ name }.controller.ts`);
}
