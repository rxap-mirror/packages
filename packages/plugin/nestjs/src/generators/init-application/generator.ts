import {
  getProjects,
  ProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nx/devkit';
import { SkipNonApplicationProject } from '@rxap/generator-utilities';
import { wrapAngularDevkitSchematic } from 'nx/src/adapter/ngcli-adapter';
import { SkipNonNestProject } from '../../lib/skip-non-nest-project';
import { InitApplicationGeneratorSchema } from './schema';

function skipProject(
  tree: Tree,
  options: InitApplicationGeneratorSchema,
  project: ProjectConfiguration,
  projectName: string,
) {

  if (SkipNonNestProject(tree, options, project, projectName)) {
    return true;
  }

  if (SkipNonApplicationProject(tree, options, project, projectName)) {
    return true;
  }

  return false;

}

export const legacyNestJsInit = wrapAngularDevkitSchematic(
  '@rxap/schematic-nestjs',
  'init',
);

export async function initApplicationGenerator(
  tree: Tree,
  options: InitApplicationGeneratorSchema,
) {
  console.log('nestjs application init generator:', options);

  for (const [ projectName, project ] of getProjects(tree).entries()) {

    if (skipProject(tree, options, project, projectName)) {
      continue;
    }

    console.log(`init project: ${ projectName }`);

    await legacyNestJsInit(tree, {
      ...options,
      project: projectName,
    });

    // apply changes to the project configuration
    updateProjectConfiguration(tree, projectName, project);
  }
}

export default initApplicationGenerator;
