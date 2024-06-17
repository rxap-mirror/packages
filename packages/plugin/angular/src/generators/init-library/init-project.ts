import {
  ProjectConfiguration,
  readJson,
  Tree,
  updateProjectConfiguration,
} from '@nx/devkit';
import { LibraryInitProject } from '@rxap/plugin-library';
import { ProjectPackageJson } from '@rxap/plugin-utilities';
import { IsBuildable } from '@rxap/workspace-utilities';
import { coerceTestSetup } from '../../lib/coerce-test-setup';
import { checkIfSecondaryEntrypointIncludeInTheTsConfig } from './check-if-secondary-entrypoint-include-in-the-ts-config';
import { cleanup } from './cleanup';
import { coerceTailwindThemeScss } from './coerce-tailwind-theme-scss';
import { extendAngularSpecificEslint } from './extend-angular-specific-eslint';
import { InitLibraryGeneratorSchema } from './schema';
import { updatePackageJson } from './update-package-json';
import { updateProjectNgPackageConfiguration } from './update-project-ng-package-configuration';
import { updateProjectTargets } from './update-project-targets';
import { updateTsConfig } from './update-ts-config';

export async function initProject(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitLibraryGeneratorSchema) {
  console.log(`init angular library project: ${ projectName }`);

  await LibraryInitProject(tree, projectName, project, options);

  cleanup(tree, project, projectName);
  updatePackageJson(tree, projectName, project);

  checkIfSecondaryEntrypointIncludeInTheTsConfig(tree, project);

  if (IsBuildable(project)) {
    updateProjectNgPackageConfiguration(tree, project);
    coerceTailwindThemeScss(tree, project);
  }
  extendAngularSpecificEslint(tree, project);
  updateProjectTargets(tree, project);
  updateTsConfig(tree, projectName);
  coerceTestSetup(tree, projectName);

  updateProjectConfiguration(tree, projectName, project);

}
