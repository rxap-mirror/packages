import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { LibraryInitProject } from '@rxap/plugin-library';
import { InitGeneratorSchema } from './schema';
import { updateProjectPackageJson } from './update-project-package-json';
import { updateProjectTags } from './update-project-tags';
import { updateProjectTargets } from './update-project-targets';

export async function initProject(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitGeneratorSchema) {
  console.log(`init n8n library project: ${ projectName }`);

  await LibraryInitProject(tree, projectName, project, options);

  updateProjectPackageJson(tree, projectName);
  updateProjectTags(project);
  updateProjectTargets(project, options);

}
