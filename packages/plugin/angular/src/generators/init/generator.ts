import {
  getProjects,
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  CoerceCypressComponentTesting,
  HasComponents,
} from '@rxap/generator-utilities';
import { SkipNonAngularProject } from '../../lib/skip-project';
import initApplicationGenerator from '../init-application/generator';
import initLibraryGenerator from '../init-library/generator';
import { InitGeneratorSchema } from './schema';

function skipProject(tree: Tree, options: InitGeneratorSchema, project: ProjectConfiguration, projectName: string) {

  if (SkipNonAngularProject(tree, options, project, projectName)) {
    return true;
  }

  return false;

}

export async function initGenerator(tree: Tree, options: InitGeneratorSchema) {
  console.log('angular init generator:', options);

  for (const [ projectName, project ] of getProjects(tree).entries()) {

    if (skipProject(tree, options, project, projectName)) {
      continue;
    }

    console.log(`init project: ${ projectName }`);

    if (HasComponents(tree, project.root)) {
      await CoerceCypressComponentTesting(tree, project, projectName);
    }

    if (project.projectType === 'library') {
      await initLibraryGenerator(tree, { ...options, projects: [ projectName ] });
    }

    if (project.projectType === 'application') {
      await initApplicationGenerator(tree, { ...options, projects: [ projectName ] });
    }

  }

}

export default initGenerator;
