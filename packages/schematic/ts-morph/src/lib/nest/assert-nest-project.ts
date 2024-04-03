import {
  Rule,
  SchematicsException,
} from '@angular-devkit/schematics';
import 'colors';
import {
  buildNestProjectDirectoryPath,
  buildNestProjectName,
  HasNestServiceProject,
} from '@rxap/workspace-utilities';

export interface AssertNestProjectOptions {
  project: string;
  feature?: string | null;
  shared?: boolean;
}

export function AssertNestProject(options: AssertNestProjectOptions): Rule {
  const { project, feature, shared } = options;
  return tree => {
    if (!HasNestServiceProject(tree, { project, feature, shared })) {
      console.log('Use the command: ' + `nx g @nx/nest:application --projectNameAndRootFormat as-provided --name ${ buildNestProjectName({ project, feature, shared }) } --directory ${ buildNestProjectDirectoryPath({ project, feature, shared }) }`.blue + ' to create the required nest project');
      console.log('Use the command: ' + `nx g @rxap/plugin-nestjs:init-application --project ${ buildNestProjectName({ project, feature, shared }) } --generateMain --overwrite`.blue + ' to initialize the nest project');
      throw new SchematicsException(`The project ${ buildNestProjectName({ project, feature, shared }) } does not exists!`);
    }
  };
}
