import {
  getProjects,
  ProjectConfiguration,
  readNxJson,
  Tree,
  updateNxJson,
  updateProjectConfiguration,
} from '@nx/devkit';
import { SkipNonLibraryProject } from '@rxap/generator-utilities';
import { InitPluginGeneratorSchema } from './schema';

function skipProject(
  tree: Tree,
  options: InitPluginGeneratorSchema,
  project: ProjectConfiguration,
  projectName: string,
): boolean {

  if (SkipNonLibraryProject(tree, options, project, projectName)) {
    return true;
  }

  if (!project.tags?.includes('plugin')) {
    return true;
  }

  return false;

}

function updateProjectTargets(project: ProjectConfiguration) {

  project.targets ??= {};

  project.targets['check-version'] = {
    executor: '@rxap/plugin-library:check-version',
    options: {
      packageName: 'nx',
    },
  };

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

export async function initPluginGenerator(
  tree: Tree,
  options: InitPluginGeneratorSchema,
) {
  console.log('plugin library init generator:', options);

  setGeneralTargetDefaults(tree);

  for (const [ projectName, project ] of getProjects(tree).entries()) {

    if (skipProject(tree, options, project, projectName)) {
      continue;
    }

    console.log(`init project: ${ projectName }`);

    updateProjectTargets(project);

    updateProjectConfiguration(tree, project.name, project);

  }

}

export default initPluginGenerator;
