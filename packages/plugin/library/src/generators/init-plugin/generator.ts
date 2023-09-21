import {
  getProjects,
  ProjectConfiguration,
  readNxJson,
  Tree,
  updateNxJson,
  updateProjectConfiguration,
} from '@nx/devkit';
import { SkipNonLibraryProject } from '@rxap/generator-utilities';
import { HasGenerators } from '@rxap/plugin-utilities';
import {
  CoerceTarget,
  CoerceTargetDefaultsDependency,
} from '@rxap/workspace-utilities';
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

function updateProjectTargets(tree: Tree, project: ProjectConfiguration) {

  CoerceTarget(project, 'check-version', {
    executor: '@rxap/plugin-library:check-version',
    options: {
      packageName: 'nx',
    },
  });

  if (HasGenerators(tree, project)) {
    CoerceTarget(project, 'expose-as-schematic', {
      executor: '@rxap/plugin-library:run-generator',
      options: {
        generator: '@rxap/plugin-library:expose-as-schematic',
      },
    });
  }

}

function setGeneralTargetDefaults(tree: Tree) {
  const nxJson = readNxJson(tree);

  CoerceTargetDefaultsDependency(nxJson, 'build', 'check-version');
  CoerceTargetDefaultsDependency(nxJson, 'build', 'expose-as-schematic');

  updateNxJson(tree, nxJson);
}

export async function initPluginGenerator(
  tree: Tree,
  options: InitPluginGeneratorSchema,
) {
  console.log('plugin library init generator:', options);

  setGeneralTargetDefaults(tree);

  if (!options.skipProjects) {

    for (const [ projectName, project ] of getProjects(tree).entries()) {

      if (skipProject(tree, options, project, projectName)) {
        continue;
      }

      console.log(`init project: ${ projectName }`);

      updateProjectTargets(tree, project);

      updateProjectConfiguration(tree, project.name, project);

    }

  }

}

export default initPluginGenerator;
