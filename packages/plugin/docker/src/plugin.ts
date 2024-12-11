import {
  CreateNodesContextV2,
  CreateNodesV2,
  ProjectConfiguration,
  TargetConfiguration,
} from '@nx/devkit';
import { DeleteEmptyProperties } from '@rxap/utilities';
import {
  FindProjectByPath,
  FsTree,
  IsAngularProject,
  IsApplicationProject,
  IsNestJsProject,
} from '@rxap/workspace-utilities';
import { Optional } from 'nx/src/project-graph/plugins';
import { dirname } from 'path';
import 'colors';

export interface PluginOptions {
  imageRegistry: string;
  imageName?: string;
  dockerfile?: string;
  push?: boolean;
}

export function normalizeOptions(
  options: PluginOptions | undefined,
): PluginOptions {
  if (!options) {
    throw new Error('The options are required');
  }
  if (!options.imageRegistry) {
    throw new Error('The options imageRegistry is required');
  }
  return options;
}

export const createNodesV2: CreateNodesV2<PluginOptions> = [
  '**/tsconfig.app.json',
  async (configFilePaths, options, context) => {
    const normalizedOptions = normalizeOptions(options);

    const includedConfigFilePaths = await Promise.all(
      configFilePaths.map(async (configFilePath) => {
        if (
          await shouldHaveProjectConfiguration(
            configFilePath,
            normalizedOptions,
            context,
          )
        ) {
          return configFilePath;
        }
        return undefined;
      }),
    ).then((configFilePathOrUndefinedList) =>
      configFilePathOrUndefinedList.filter((value) => value !== undefined),
    );

    const results = await Promise.all(
      includedConfigFilePaths.map(async (configFilePath) => {
        const [ projectPath, projectConfiguration ] =
          await createProjectConfiguration(
            configFilePath,
            normalizedOptions,
            context,
          );
        return [ configFilePath, projectPath, projectConfiguration ] as [
          string,
          string,
          Optional<ProjectConfiguration, 'root'>
        ];
      }),
    );

    return results.map(
      ([ configFilePath, projectPath, projectConfiguration ]) => [
        configFilePath,
        {
          projects: {
            [projectPath]: projectConfiguration,
          },
        },
      ],
    );
  },
];

async function shouldHaveProjectConfiguration(
  configFilePath: string,
  options: PluginOptions,
  context: CreateNodesContextV2,
): Promise<boolean> {
  const projectPath = dirname(configFilePath);
  const tree = new FsTree(context.workspaceRoot);
  const projectConfiguration = FindProjectByPath(tree, projectPath);
  if (!projectConfiguration) {
    console.log(`The folder of the file '${ configFilePath }' is not the root of a project. Skipping`.yellow);
    return false;
  }
  if ((
        !IsAngularProject(projectConfiguration) && !IsNestJsProject(projectConfiguration)
      ) || !IsApplicationProject(projectConfiguration)) {
    return false;
  }
  return true;
}

async function createProjectConfiguration(
  configFilePath: string,
  options: PluginOptions,
  context: CreateNodesContextV2,
): Promise<[ string, Optional<ProjectConfiguration, 'root'> ]> {
  const projectPath = dirname(configFilePath);
  const targets: Record<string, TargetConfiguration> = {};

  targets['docker'] = createDockerBuildTarget(options);
  targets['docker-save'] = createDockerSaveTarget();

  return [
    projectPath, {
      targets,
    },
  ];
}

function createDockerBuildTarget(options: PluginOptions): TargetConfiguration {
  return {
    executor: '@rxap/plugin-docker:build',
    options: DeleteEmptyProperties({
      imageRegistry: options.imageRegistry,
      imageName: options.imageName,
      push: options.push,
      dockerfile: options.dockerfile,
    }),
    dependsOn: [ 'build' ],
  };
}

function createDockerSaveTarget(): TargetConfiguration {
  return {
    executor: '@rxap/plugin-docker:save',
    dependsOn: [ 'docker' ],
  };
}
