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
  backend: { project?: string | null, kind?: any } | undefined;
}

export function AssertNestProject(options: AssertNestProjectOptions): Rule {
  const { project, feature, shared, backend } = options;
  return tree => {
    if (!HasNestServiceProject(tree, { project, feature, shared, backend })) {

      // TODO : run the commands on the fly instead of throwing an error

      console.log('Use the command: ' + `nx g @nx/nest:application --projectNameAndRootFormat as-provided --name ${ buildNestProjectName({ project, feature, shared, backend }) } --directory ${ buildNestProjectDirectoryPath({ project, feature, shared, backend }) }`.blue + ' to create the required nest project');
      console.log('Use the command: ' + `nx g @rxap/plugin-nestjs:init-application --project ${ buildNestProjectName({ project, feature, shared, backend }) } --generateMain --overwrite`.blue + ' to initialize the nest project');
      throw new SchematicsException(`The project ${ buildNestProjectName({ project, feature, shared, backend }) } does not exists!`);

    }
  };
}
