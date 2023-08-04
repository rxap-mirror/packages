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
import { DockerGitlabCiGenerator } from '@rxap/plugin-docker';
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

function buildDockerImageSuffix(project: ProjectConfiguration) {
  let imageSuffix = `/`;
  if (project.targets?.['build']?.executor?.includes('angular') ||
    project.name.startsWith('frontend') ||
    project.name.startsWith('ui') ||
    project.name.startsWith('user-interface') ||
    project.name.startsWith('application')) {
    imageSuffix +=
      [ 'user-interface', project.name.replace(/^(application|user-interface|ui|frontend)-/, '') ].join('/');
  } else if (project.name.startsWith('service') || project.name.startsWith('backend')) {
    imageSuffix += [ 'service', project.name.replace(/^(service|backend)-/, '') ].join('/');
  } else {
    imageSuffix += project.name;
  }
  return imageSuffix;
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
      imageSuffix: options.dockerImageSuffix ?? buildDockerImageSuffix(project),
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

  if (project.targets?.['build']?.configurations?.['production']) {
    CoerceTarget(project, 'build', {
      defaultConfiguration: 'production',
    });
  }

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

  await DockerGitlabCiGenerator(tree, options as any);

}

export default initGenerator;
