import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  GetProject,
  HasProject,
} from '@rxap/workspace-utilities';
import { initE2eProject } from './init-e2e-project';
import { InitGeneratorSchema } from './schema';
import { updateJestConfig } from './update-jest-config';
import { updateProjectTargets } from './update-project-targets';
import { updateTags } from './update-tags';

export function initProject(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitGeneratorSchema) {
  console.log(`init application project: ${ projectName }`);

  updateTags(project, options);

  updateProjectTargets(project, projectName, options);

  // region update jest config
  const jestConfigFileName = options.standalone ? 'jest.config.config.ts' : 'jest.config.ts';

  updateJestConfig(tree, project, projectName, options, jestConfigFileName);

  if (options.standalone) {
    if (HasProject(tree, `${projectName}-e2e`)) {
      const e2eProject = GetProject(tree, `${projectName}-e2e`);
      initE2eProject(tree, `${projectName}-e2e`, e2eProject, options);
    }
  }
  // endregion

}
