import {
  ProjectConfiguration,
  readProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { HasTarget } from '@rxap/workspace-utilities';
import { cleanup } from '../../lib/cleanup';
import { coerceComponentTestTarget } from '../../lib/coerce-component-test-target';
import { coerceCypressConfig } from '../../lib/coerce-cypress-config';
import { coerceCypressImports } from '../../lib/coerce-cypress-imports';
import { setupComponentTestTarget } from '../../lib/setup-component-test-target';
import { InitLibraryGeneratorSchema } from './schema';


export async function initProject(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitLibraryGeneratorSchema) {
  console.log(`init cypress library project: ${ projectName }`);

  if (options.component) {
    if (!HasTarget(tree, projectName, 'component-test')) {
      await setupComponentTestTarget(tree, projectName, options);
      const updateProject = readProjectConfiguration(tree, projectName);
      project.targets['component-test'] = updateProject.targets['component-test']!;
    }
  }

  coerceComponentTestTarget(tree, projectName, project);
  coerceCypressImports(tree, projectName);
  coerceCypressConfig(tree, projectName);
  cleanup(tree, projectName);

}
