import {
  getProjects,
  ProjectConfiguration,
  readNxJson,
  Tree,
  updateNxJson,
  updateProjectConfiguration,
} from '@nx/devkit';
import { SkipNonLibraryProject } from '@rxap/generator-utilities';
import { SkipNonNestProject } from '../../lib/skip-non-nest-project';
import { InitApplicationGeneratorSchema } from '../init-application/schema';

function skipProject(
  tree: Tree,
  options: InitApplicationGeneratorSchema,
  project: ProjectConfiguration,
  projectName: string,
) {

  if (SkipNonNestProject(tree, options, project, projectName)) {
    return true;
  }

  if (SkipNonLibraryProject(tree, options, project, projectName)) {
    return true;
  }

  return false;

}

function setGeneralTargetDefaults(tree: Tree) {
  const nxJson = readNxJson(tree);
  nxJson.targetDefaults ??= {};

  nxJson.targetDefaults['build'] ??= { dependsOn: [ '^build' ] };

  if (!nxJson.targetDefaults['build']?.dependsOn?.includes('check-version')) {
    nxJson.targetDefaults['build'].dependsOn.push('check-version');
  }

  updateNxJson(tree, nxJson);
}

function updateProjectTargets(project: ProjectConfiguration) {

  project.targets ??= {};

  project.targets['check-version'] = {
    executor: '@rxap/plugin-library:check-version',
    options: {
      packageName: '@nestjs/core',
    },
  };

}

export async function initLibraryGenerator(
  tree: Tree,
  options: InitApplicationGeneratorSchema,
) {
  console.log('nestjs library init generator:', options);

  setGeneralTargetDefaults(tree);

  for (const [ projectName, project ] of getProjects(tree).entries()) {

    if (skipProject(tree, options, project, projectName)) {
      continue;
    }

    console.log(`init project: ${ projectName }`);

    updateProjectTargets(project);


    // apply changes to the project configuration
    updateProjectConfiguration(tree, projectName, project);
  }
}

export default initLibraryGenerator;
