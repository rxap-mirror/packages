import {
  getProjects,
  ProjectConfiguration,
  readNxJson,
  Tree,
  updateNxJson,
  updateProjectConfiguration,
} from '@nx/devkit';
import {
  CoerceAssets,
  CoerceIgnorePattern,
  SkipNonApplicationProject,
} from '@rxap/generator-utilities';
import { AngularInitGenerator } from '@rxap/plugin-angular';
import {
  CoerceTarget,
  CoerceTargetDefaultsDependency,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import * as process from 'process';
import { InitGeneratorSchema } from './schema';

function skipProject(
  tree: Tree,
  options: InitGeneratorSchema,
  project: ProjectConfiguration,
  projectName: string,
): boolean {
  if (SkipNonApplicationProject(tree, options, project, projectName)) {
    return true;
  }

  return false;
}

function updateProjectTargets(project: ProjectConfiguration, options: InitGeneratorSchema) {
  project.targets ??= {};

  if (!project.targets['build']) {
    throw new Error(`The project '${ project.name }' has no build target`);
  }

  project.targets['build'].options ??= {};
  project.targets['build'].options.assets ??= [];
  CoerceAssets(project.targets['build'].options.assets, [ join(project.sourceRoot, 'build.json') ]);

  CoerceTarget(project, 'build-info', {
    executor: '@rxap/plugin-application:build-info',
    options: {},
    configurations: {
      production: {},
      development: {},
    },
  });
  CoerceTarget(project, 'docker', {
    executor: '@rxap/plugin-docker:build',
    options: {
      imageName: options.dockerImageName ?? process.env.IMAGE_NAME,
      imageSuffix: options.dockerImageSuffix,
      imageRegistry: options.dockerImageRegistry ?? process.env.REGISTRY,
    },
    configurations: {
      production: {},
      development: {},
    },
  });
  CoerceTarget(project, 'docker-save', {
    executor: '@rxap/plugin-docker:save',
    options: {},
    configurations: {
      production: {},
      development: {},
    },
  });

}

function updateTargetDefaults(tree: Tree) {
  const nxJson = readNxJson(tree);

  CoerceTargetDefaultsDependency(nxJson, 'docker', 'build');
  CoerceTargetDefaultsDependency(nxJson, 'docker-save', 'docker');
  CoerceTargetDefaultsDependency(nxJson, 'build', 'build-info');
  CoerceTargetDefaultsDependency(nxJson, 'serve', 'build-info');

  updateNxJson(tree, nxJson);
}

function updateGitIgnore(project: ProjectConfiguration, tree: Tree) {

  const gitIgnorePath = join(project.sourceRoot, '.gitignore');
  CoerceIgnorePattern(tree, gitIgnorePath, [
    '/build.json',
  ]);

}

export async function initGenerator(tree: Tree, options: InitGeneratorSchema) {
  console.log('application init generator:', options);

  for (const [ projectName, project ] of getProjects(tree).entries()) {

    if (skipProject(tree, options, project, projectName)) {
      continue;
    }

    console.log(`init project: ${ projectName }`);

    updateProjectTargets(project, options);

    updateTargetDefaults(tree);
    updateGitIgnore(project, tree);

    // apply changes to the project configuration
    updateProjectConfiguration(tree, projectName, project);

    if (project.tags?.includes('angular')) {
      await AngularInitGenerator(tree, { ...options, projects: [ projectName ] });
    }

  }

}

export default initGenerator;
