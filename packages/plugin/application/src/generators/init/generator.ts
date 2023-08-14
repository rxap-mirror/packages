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
import { nestJsInitGenerator } from '@rxap/plugin-nestjs';
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

function buildDockerImageSuffix(project: ProjectConfiguration, projectName: string) {
  let imageSuffix = `/`;
  if (project.targets?.['build']?.executor?.includes('angular') ||
    projectName.startsWith('frontend') ||
    projectName.startsWith('ui') ||
    projectName.startsWith('user-interface') ||
    projectName.startsWith('application')) {
    imageSuffix +=
      [ 'user-interface', projectName.replace(/^(application|user-interface|ui|frontend)-/, '') ].join('/');
  } else if (projectName.startsWith('service') || projectName.startsWith('backend')) {
    imageSuffix += [ 'service', projectName.replace(/^(service|backend)-/, '') ].join('/');
  } else {
    imageSuffix += projectName;
  }
  return imageSuffix;
}

function updateProjectTargets(project: ProjectConfiguration, projectName: string, options: InitGeneratorSchema) {
  project.targets ??= {};

  if (!project.targets['build']) {
    throw new Error(`The project '${ project.name }' has no build target`);
  }

  if (!project.sourceRoot) {
    throw new Error(`The project '${ project.name }' has no source root`);
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
      imageSuffix: options.dockerImageSuffix ?? buildDockerImageSuffix(project, projectName),
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

  if (!nxJson) {
    throw new Error('No nx.json found');
  }

  CoerceTargetDefaultsDependency(nxJson, 'docker', 'build');
  CoerceTargetDefaultsDependency(nxJson, 'docker-save', 'docker');
  CoerceTargetDefaultsDependency(nxJson, 'build', 'build-info');
  CoerceTargetDefaultsDependency(nxJson, 'serve', 'build-info');

  updateNxJson(tree, nxJson);
}

function updateGitIgnore(project: ProjectConfiguration, tree: Tree) {

  if (!project.sourceRoot) {
    throw new Error(`The project '${ project.name }' has no source root`);
  }

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

    updateProjectTargets(project, projectName, options);

    updateTargetDefaults(tree);
    updateGitIgnore(project, tree);

    // apply changes to the project configuration
    updateProjectConfiguration(tree, projectName, project);

    if (project.tags?.includes('angular')) {
      await AngularInitGenerator(tree, { ...options, projects: [ projectName ] });
    }

    if (project.tags?.includes('nest')) {
      await nestJsInitGenerator(
        tree,
        {
          ...options,
          projects: [ projectName ],
        },
      );
    }

  }

  await DockerGitlabCiGenerator(tree, options as any);

}

export default initGenerator;
