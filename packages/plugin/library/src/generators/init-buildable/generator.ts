import {
  getProjects,
  ProjectConfiguration,
  readNxJson,
  Tree,
  updateNxJson,
  updateProjectConfiguration,
} from '@nx/devkit';
import { SkipNonBuildableProject } from '@rxap/generator-utilities';
import {
  CoerceTarget,
  CoerceTargetDefaultsDependency,
} from '@rxap/workspace-utilities';
import { InitGeneratorSchema } from '../init/schema';
import { InitBuildableGeneratorSchema } from './schema';

function setGeneralTargetDefaults(tree: Tree) {
  const nxJson = readNxJson(tree);

  CoerceTargetDefaultsDependency(nxJson, 'build', '^build');

  updateNxJson(tree, nxJson);

}

function updateProjectTargets(project: ProjectConfiguration) {
  if (project.targets?.['build']?.configurations?.['production']) {
    CoerceTarget(project, 'build', {
      defaultConfiguration: 'production',
    });
  }
}

function skipProject(
  tree: Tree,
  options: InitGeneratorSchema,
  project: ProjectConfiguration,
  projectName: string,
): boolean {

  if (SkipNonBuildableProject(tree, options, project, projectName)) {
    return true;
  }

  return false;

}

export async function initBuildableGenerator(
  tree: Tree,
  options: InitBuildableGeneratorSchema,
) {
  console.log('buildable library init generator:', options);

  setGeneralTargetDefaults(tree);

  if (!options.skipProjects) {
    for (const [ projectName, project ] of getProjects(tree).entries()) {

      if (skipProject(tree, options, project, projectName)) {
        continue;
      }

      console.log(`init project: ${ projectName }`);
      updateProjectTargets(project);

      updateProjectConfiguration(tree, project.name, project);

    }
  }
}

export default initBuildableGenerator;
