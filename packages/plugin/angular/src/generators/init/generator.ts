import {
  getProjects,
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { HasComponents } from '@rxap/generator-utilities';
import {
  IsApplicationProject,
  IsLibraryProject,
} from '@rxap/workspace-utilities';
import { CoerceCypressComponentTesting } from '../../lib/coerce-cypress-component-testing';
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

    if (IsLibraryProject(project)) {
      await initLibraryGenerator(tree,
        {
          ...options,
          projects: [ projectName ],
          skipProjects: options.skipProjects,
        },
      );
    }

    if (IsApplicationProject(project)) {
      await initApplicationGenerator(tree,
        {
          ...options,
          projects: [ projectName ],
          skipProjects: options.skipProjects,
        },
      );
    }

    if (!options.skipProjects) {

      console.log(`init project: ${ projectName }`);

      // execute the add cypress if the project has components after the library/application init
      // as the library init will remove the default components so that cypress is only added
      // if the project has really any components
      if (HasComponents(tree, project.root)) {
        await CoerceCypressComponentTesting(tree, project, projectName);
      }

    }

  }

}

export default initGenerator;
