import {
  getProjects,
  NxJsonConfiguration,
  ProjectConfiguration,
  readNxJson,
  TargetConfiguration,
  Tree,
  updateNxJson,
  updateProjectConfiguration,
} from '@nx/devkit';
import { SkipNonApplicationProject } from '@rxap/generator-utilities';
import { AngularInitGenerator } from '@rxap/plugin-angular';
import { DockerGitlabCiGenerator } from '@rxap/plugin-docker';
import { nestJsInitGenerator } from '@rxap/plugin-nestjs';
import {
  deepMerge,
  DeleteEmptyProperties,
  MergeDeepLeft,
} from '@rxap/utilities';
import {
  AddPackageJsonDependency,
  CoerceFilesStructure,
  CoerceTarget,
  CoerceTargetDefaultsDependency,
  GetPackageJson,
  Strategy,
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

  CoerceTarget(project, 'docker', {
    options: DeleteEmptyProperties({
      imageName: options.dockerImageName,
      imageSuffix: options.dockerImageSuffix ?? buildDockerImageSuffix(project, projectName),
      imageRegistry: options.dockerImageRegistry,
    }),
  });
  CoerceTarget(project, 'docker-save');

  // if the build target has a configuration for production
  if (project.targets?.['build']?.configurations?.['production']) {
    // set the default configuration to production
    project.targets['build'].defaultConfiguration = 'production';
    // ensure the build target has a configuration for development
    project.targets['build'].configurations['development'] ??= {};
    // if the project has a serve target with a buildTarget option
    if (project.targets?.['serve'].options?.buildTarget) {
      // ensure that the target configuration is explicitly set
      if (project.targets['serve'].options.buildTarget.match(new RegExp(`^${projectName}:build$`))) {
        // if not the set the build configuration to development
        project.targets['serve'].options.buildTarget += ':development';
      }
    }
  }

}

function guessImageName(tree: Tree) {
  const rootPackageJson = GetPackageJson(tree);
  if (rootPackageJson.repository) {
    const repo = typeof rootPackageJson.repository === 'string' ?
      rootPackageJson.repository :
      rootPackageJson.repository.url;
    if (repo) {
      const match = repo.match(/https:\/\/([^/]+)\/(.+)\.git$/);
      if (match) {
        if (match[1] === 'gitlab.com') {
          return match[2];
        }
      }
    }
  }
  const name = rootPackageJson.name;
  const match = name?.match(/@([^/]+)\/(.+)$/);
  if (match) {
    if (match[2] === 'source') {
      return match[1];
    }
    return match[2];
  }
  return 'unknown';
}

function CoerceTargetDefaults(
  nxJson: NxJsonConfiguration,
  name: string,
  target: Partial<TargetConfiguration>,
  strategy = Strategy.DEFAULT,
) {

  nxJson.targetDefaults ??= {};
  if (!nxJson.targetDefaults[name]) {
    nxJson.targetDefaults[name] = target;
  } else {
    switch (strategy) {
      case Strategy.DEFAULT:
        break;
      case Strategy.OVERWRITE:
        nxJson.targetDefaults[name] = deepMerge(nxJson.targetDefaults[name], target);
        break;
      case Strategy.MERGE:
        nxJson.targetDefaults[name] = deepMerge(nxJson.targetDefaults[name], target, MergeDeepLeft);
        break;
      case Strategy.REPLACE:
        nxJson.targetDefaults[name] = target;
        break;
    }
  }

}

function updateTargetDefaults(tree: Tree) {
  const nxJson = readNxJson(tree);

  if (!nxJson) {
    throw new Error('No nx.json found');
  }

  CoerceTargetDefaultsDependency(nxJson, 'docker', 'build');
  CoerceTargetDefaultsDependency(nxJson, 'docker-save', 'docker');

  CoerceTargetDefaults(nxJson, 'docker-save', {
    executor: '@rxap/plugin-docker:save',
  });
  CoerceTargetDefaults(nxJson, 'docker', {
    executor: '@rxap/plugin-docker:build',
    options: {
      imageRegistry: process.env.REGISTRY ?? 'registry.gitlab.com',
      imageName: process.env.IMAGE_NAME ?? guessImageName(tree),
    },
  }, Strategy.MERGE);

  updateNxJson(tree, nxJson);
}

function updateGitIgnore(project: ProjectConfiguration, tree: Tree) {

  if (!project.sourceRoot) {
    throw new Error(`The project '${ project.name }' has no source root`);
  }

}

export async function initGenerator(tree: Tree, options: InitGeneratorSchema) {
  console.log('application init generator:', options);

  await AddPackageJsonDependency(tree, '@rxap/plugin-docker', 'latest', { soft: true });

  CoerceFilesStructure(tree, {
    srcFolder: join(__dirname, 'files', 'general'),
    target: '',
    overwrite: options.overwrite,
  });

  if (options.authentik) {
    CoerceFilesStructure(tree, {
      srcFolder: join(__dirname, 'files', 'authentik'),
      target: '',
      overwrite: options.overwrite,
    });
  }

  if (options.minio) {
    CoerceFilesStructure(tree, {
      srcFolder: join(__dirname, 'files', 'minio'),
      target: '',
      overwrite: options.overwrite,
    });
  }

  for (const [ projectName, project ] of getProjects(tree).entries()) {

    if (skipProject(tree, options, project, projectName)) {
      continue;
    }

    if (!options.skipProjects) {
      console.log(`init project: ${ projectName }`);

      updateProjectTargets(project, projectName, options);

      updateTargetDefaults(tree);
      updateGitIgnore(project, tree);

      // apply changes to the project configuration
      updateProjectConfiguration(tree, projectName, project);
    }

    if (project.tags?.includes('angular')) {
      await AngularInitGenerator(tree,
        {
          ...options,
          projects: [ projectName ],
          skipProjects: options.skipProjects,
        },
      );
    }

    if (project.tags?.includes('nest')) {
      await nestJsInitGenerator(
        tree,
        {
          ...options,
          projects: [ projectName ],
          skipProjects: options.skipProjects,
        },
      );
    }

  }

  await DockerGitlabCiGenerator(tree, options as any);

}

export default initGenerator;
