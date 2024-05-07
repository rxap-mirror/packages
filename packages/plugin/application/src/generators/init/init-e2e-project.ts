import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  CoerceProjectTags,
  CoerceTarget,
  Strategy,
} from '@rxap/workspace-utilities';
import { InitGeneratorSchema } from './schema';
import { updateJestConfig } from './update-jest-config';

export function initE2eProject(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitGeneratorSchema) {

  updateJestConfig(tree, project, projectName, options);

  CoerceTarget(project, 'e2e', {
    "configurations": {
      "ci": {
        "coverageReporters": [
          "json"
        ],
        "codeCoverage": true
      }
    }
  }, Strategy.OVERWRITE);

  CoerceProjectTags(project, [ 'e2e' ]);

}
