import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { isLegacyConfiguration } from '../init-application/is-legacy-configuration';
import { SwaggerGeneratorSchema } from './schema';

export function updateProjectTargets(
  tree: Tree, projectName: string, project: ProjectConfiguration, options: SwaggerGeneratorSchema) {

  if (isLegacyConfiguration(project)) {
    return;
  }

}
