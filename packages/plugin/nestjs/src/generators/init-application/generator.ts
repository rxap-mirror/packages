import {
  getProjects,
  ProjectConfiguration,
  readNxJson,
  Tree,
  updateNxJson,
  updateProjectConfiguration,
} from '@nx/devkit';
import {
  CoerceIgnorePattern,
  SkipNonApplicationProject,
} from '@rxap/generator-utilities';
import { CoerceTargetDefaultsDependency } from '@rxap/workspace-utilities';
import { wrapAngularDevkitSchematic } from 'nx/src/adapter/ngcli-adapter';
import { join } from 'path';
import { SkipNonNestProject } from '../../lib/skip-non-nest-project';
import { InitApplicationGeneratorSchema } from './schema';

function skipProject(
  tree: Tree,
  options: InitApplicationGeneratorSchema,
  project: ProjectConfiguration,
  projectName: string,
) {

  if (SkipNonNestProject(tree, options, project, projectName)) {
    return true;
  }

  if (SkipNonApplicationProject(tree, options, project, projectName)) {
    return true;
  }

  return false;

}

function setGeneralTargetDefaults(tree: Tree) {
  const nxJson = readNxJson(tree);

  CoerceTargetDefaultsDependency(nxJson, 'build', 'generate-package-json');

  updateNxJson(tree, nxJson);
}

function updateProjectTargets(project: ProjectConfiguration) {

  project.targets ??= {};

  project.targets['generate-package-json'] = {
    executor: '@rxap/plugin-nestjs:package-json',
    configurations: {
      production: {},
    },
  };

}

function updateGitIgnore(tree: Tree, project: ProjectConfiguration) {
  CoerceIgnorePattern(tree, join(project.root, '.gitignore'), [ 'package.json' ]);
}

export async function initApplicationGenerator(
  tree: Tree,
  options: InitApplicationGeneratorSchema,
) {
  console.log('nestjs application init generator:', options);

  setGeneralTargetDefaults(tree);

  for (const [ projectName, project ] of getProjects(tree).entries()) {

    if (skipProject(tree, options, project, projectName)) {
      continue;
    }

    console.log(`init project: ${ projectName }`);

    updateProjectTargets(project);
    updateGitIgnore(tree, project);

    // apply changes to the project configuration
    updateProjectConfiguration(tree, projectName, project);

    if (options.legacy) {
      await wrapAngularDevkitSchematic(
        '@rxap/schematic-nestjs',
        'init',
      )(tree, {
        ...options,
        project: projectName,
      });
    }

  }
}

export default initApplicationGenerator;
