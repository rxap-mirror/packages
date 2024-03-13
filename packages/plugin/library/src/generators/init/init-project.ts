import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  IsBuildable,
  IsPublishable,
} from '@rxap/generator-utilities';
import { IsPluginProject } from '@rxap/workspace-utilities';
import { initProject as initBuildableProject } from '../init-buildable/init-project';
import { initProject as initPluginProject } from '../init-plugin/init-project';
import { initProject as initPublishableProject } from '../init-publishable/init-project';
import { InitGeneratorSchema } from './schema';
import { updateProjectTags } from './update-project-tags';
import { updateProjectTargets } from './update-project-targets';

export async function initProject(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitGeneratorSchema) {
  console.log(`init library project: ${ projectName }`);

  updateProjectTags(project);

  updateProjectTargets(project);

  if (IsBuildable(project)) {
    initBuildableProject(tree, projectName, project, options);
  }

  if (IsPublishable(tree, project)) {
    initPublishableProject(tree, projectName, project, options);
  }

  if (IsPluginProject(project)) {
    await initPluginProject(tree, projectName, project, options);
  }

}
