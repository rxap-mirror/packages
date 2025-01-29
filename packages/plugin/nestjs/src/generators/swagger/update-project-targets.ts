import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  CoerceTarget,
  Strategy,
} from '@rxap/workspace-utilities';
import { isLegacyConfiguration } from '../init-application/is-legacy-configuration';
import { SwaggerGeneratorSchema } from './schema';

export function updateProjectTargets(
  tree: Tree, projectName: string, project: ProjectConfiguration, options: SwaggerGeneratorSchema) {

  if (isLegacyConfiguration(project)) {
    return;
  }

  CoerceTarget(project, 'build', {
    configurations: {
      swagger: {
        config: 'webpack.config.swagger.js',
        args: [
          "node-env=development"
        ]
      }
    }
  }, Strategy.MERGE);

}
