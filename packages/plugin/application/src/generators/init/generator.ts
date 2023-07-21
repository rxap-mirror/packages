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
  SkipNonApplicationProject,
} from '@rxap/generator-utilities';
import { AngularInitGenerator } from '@rxap/plugin-angular';
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
  CoerceAssets(project.targets['build'].options.assets, [ 'build.json' ]);

  project.targets['build-info'] ??= {
    executor: '@rxap/plugin-application:build-info',
    options: {},
    configurations: {
      production: {},
      development: {},
    },
  };
  project.targets['docker'] ??= {
    executor: '@rxap/plugin-docker:build',
    options: {
      imageName: options.dockerImageName,
      imageSuffix: options.dockerImageSuffix,
      imageRegistry: options.dockerImageRegistry,
    },
    configurations: {
      production: {},
      development: {},
    },
  };
  project.targets['docker-save'] ??= {
    executor: '@rxap/plugin-docker:save',
    options: {},
    configurations: {
      production: {},
      development: {},
    },
  };
}

function updateTargetDefaults(tree: Tree) {
  const nxJson = readNxJson(tree);

  nxJson.targetDefaults ??= {};
  nxJson.targetDefaults['docker'] ??= {};
  nxJson.targetDefaults['docker'].dependsOn ??= [];
  if (!nxJson.targetDefaults['docker'].dependsOn.includes('build')) {
    nxJson.targetDefaults['docker'].dependsOn.push('build');
  }
  if (!nxJson.targetDefaults['docker'].dependsOn.includes('build-info')) {
    nxJson.targetDefaults['docker'].dependsOn.push('build-info');
  }
  if (nxJson.targetDefaults['save']) {
    delete nxJson.targetDefaults['save'];
  }
  nxJson.targetDefaults['docker-save'] ??= {};
  nxJson.targetDefaults['docker-save'].dependsOn ??= [];
  if (!nxJson.targetDefaults['docker-save'].dependsOn.includes('docker')) {
    nxJson.targetDefaults['save'].dependsOn.push('docker');
  }

  nxJson.targetDefaults['build'] ??= {};
  nxJson.targetDefaults['build'].dependsOn ??= [];
  if (!nxJson.targetDefaults['build'].dependsOn.includes('build-info')) {
    nxJson.targetDefaults['build'].dependsOn.push('build-info');
  }

  updateNxJson(tree, nxJson);
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

    // apply changes to the project configuration
    updateProjectConfiguration(tree, projectName, project);

    if (project.tags?.includes('angular')) {
      await AngularInitGenerator(tree, { ...options, projects: [ projectName ] });
    }

  }

}

export default initGenerator;
