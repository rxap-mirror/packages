import {
  SchematicsException,
  Tree,
} from '@angular-devkit/schematics';
import {
  GetProjectSourceRoot,
  HasProject,
} from '@rxap/workspace-utilities';
import { buildNestProjectName } from '@rxap/workspace-utilities';

export interface HasNestControllerOptions {
  project: string;
  feature?: string | null;
  shared?: boolean;
  name: string;
  nestModule: string;
  backend: { project?: string | null, kind?: any } | undefined;
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
