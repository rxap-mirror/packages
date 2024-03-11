import {
  getProjects,
  ProjectConfiguration,
  readNxJson,
  Tree,
  updateProjectConfiguration,
} from '@nx/devkit';
import { SkipNonApplicationProject } from '@rxap/generator-utilities';
import { CoerceArrayItems } from '@rxap/utilities';
import { GetProjectByPackageName } from '@rxap/workspace-utilities';
import { FixImplicitInternalDependenciesGeneratorSchema } from './schema';

function skipProject(
  tree: Tree,
  options: FixImplicitInternalDependenciesGeneratorSchema,
  project: ProjectConfiguration,
  projectName: string,
): boolean {

  if (SkipNonApplicationProject(tree, options, project, projectName)) {
    return true;
  }

  return false;

}

export async function fixImplicitInternalDependenciesGenerator(
  tree: Tree,
  options: FixImplicitInternalDependenciesGeneratorSchema
) {
  console.log('fix implicit internal dependencies generator:', options);

  const nxJson = readNxJson(tree);

  for (const [ projectName, project ] of getProjects(tree).entries()) {

    if (skipProject(tree, options, project, projectName)) {
      continue;
    }

    console.log(`fix implicit internal dependencies for project: ${ projectName }`);

    for (const [ target, config ] of Object.entries(project.targets ?? {})) {
      const executor = config.executor ?? nxJson?.targetDefaults?.[target]?.executor;
      if (!executor) {
        console.warn(`No executor found for project '${projectName}' and target: ${ target }`);
        continue;
      }
      const packageName = executor.split(':')[0];
      const internalProject = GetProjectByPackageName(tree, packageName);
      if (internalProject?.name) {
        if (internalProject.name === projectName) {
          console.warn(`internal project is the same as the current project: ${ projectName }`);
          continue;
        }
        console.log(`add implicit internal dependency to project: ${ projectName } for target: ${ target } with: ${ internalProject.name }`);
        project.implicitDependencies ??= [];
        CoerceArrayItems(project.implicitDependencies, [internalProject.name]);
      }
    }

    updateProjectConfiguration(tree, projectName, project);

  }

}

export default fixImplicitInternalDependenciesGenerator;
