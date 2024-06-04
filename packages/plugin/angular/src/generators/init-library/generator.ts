import {
  formatFiles,
  getProjects,
  ProjectConfiguration,
  readJson,
  Tree,
  updateProjectConfiguration,
} from '@nx/devkit';
import {
  LibraryInitProject,
  LibraryInitWorkspace,
} from '@rxap/plugin-library';
import { ProjectPackageJson } from '@rxap/plugin-utilities';
import { CoerceArrayItems } from '@rxap/utilities';
import {
  AddPackageJsonDependency,
  GenerateSerializedSchematicFile,
  GetProjectRoot,
  IsBuildable,
  SkipNonAngularProject,
  SkipNonLibraryProject,
} from '@rxap/workspace-utilities';
import { ANGULAR_VERSION } from '../../lib/angular-version';
import { coerceTestSetup } from '../../lib/coerce-test-setup';
import { InitGeneratorSchema } from '../init/schema';
import { checkIfSecondaryEntrypointIncludeInTheTsConfig } from './check-if-secondary-entrypoint-include-in-the-ts-config';
import { cleanup } from './cleanup';
import { coerceProjects } from './coerce-projects';
import { coerceTailwindThemeScss } from './coerce-tailwind-theme-scss';
import { extendAngularSpecificEslint } from './extend-angular-specific-eslint';
import { InitLibraryGeneratorSchema } from './schema';
import { setGeneralTargetDefaults } from './set-general-target-defaults';
import { updatePackageJson } from './update-package-json';
import { updateProjectNgPackageConfiguration } from './update-project-ng-package-configuration';
import { updateProjectTargets } from './update-project-targets';
import { updateTsConfig } from './update-ts-config';

function skipProject(tree: Tree, options: InitGeneratorSchema, project: ProjectConfiguration, projectName: string) {

  if (SkipNonAngularProject(tree, options, project, projectName)) {
    return true;
  }

  if (SkipNonLibraryProject(tree, options, project, projectName)) {
    return true;
  }

  return false;

}

export async function initLibraryGenerator(
  tree: Tree,
  options: InitLibraryGeneratorSchema,
) {
  options.project ??= undefined;
  options.projects ??= [];
  if (options.project) {
    CoerceArrayItems(options.projects, [options.project]);
  }
  console.log('angular library init generator:', options);

  // must always be added as some rxap components use the i18n tag
  await AddPackageJsonDependency(tree, '@angular/localize', ANGULAR_VERSION, { soft: true });

  LibraryInitWorkspace(tree, options);

  setGeneralTargetDefaults(tree);

  if (options.coerce) {
    await coerceProjects(tree, options);
  }

  const rootPackageJson: ProjectPackageJson = readJson(tree, 'package.json');

  if (!options.skipProjects) {

    for (const [ projectName, project ] of getProjects(tree).entries()) {

      if (skipProject(tree, options, project, projectName)) {
        continue;
      }

      GenerateSerializedSchematicFile(
        tree,
        GetProjectRoot(tree, projectName),
        '@rxap/plugin-angular',
        'init-library',
        options,
      );

      console.log(`init angular library project: ${ projectName }`);

      await LibraryInitProject(tree, projectName, project, options);

      cleanup(tree, project, projectName);
      updatePackageJson(tree, project, rootPackageJson);

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

  }

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

}

export default initLibraryGenerator;
