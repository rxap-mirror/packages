import {
  Rule,
  SchematicsException,
} from '@angular-devkit/schematics';
import {
  buildNestProjectName,
  HasNestServiceProject,
} from './project-utilities';

export interface AssertNestProjectOptions {
  project: string;
  feature?: string | null;
  shared?: boolean;
}

export function AssertNestProject(options: AssertNestProjectOptions): Rule {
  const { project, feature, shared } = options;
  return tree => {
    if (!HasNestServiceProject(tree, { project, feature, shared })) {
      throw new SchematicsException(`The project ${ buildNestProjectName({ project, feature, shared }) } does not exists!`);
    }
  };
}
