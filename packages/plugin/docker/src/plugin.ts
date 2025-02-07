import {
  CreateNodesContextV2,
  CreateNodesV2,
  ProjectConfiguration,
  TargetConfiguration,
} from '@nx/devkit';
import {
  FindProjectByPath,
  IsAngularProject,
  IsApplicationProject,
  IsNestJsProject,
} from '@rxap/workspace-utilities';
import { FsTree } from 'nx/src/generators/tree';
import { Optional } from 'nx/src/project-graph/plugins';
import { combineGlobPatterns } from 'nx/src/utils/globs';
import 'colors';
import {
  dirname,
  join,
} from 'path';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PluginOptions {}

export function normalizeOptions(
  options: PluginOptions | undefined,
): PluginOptions {
  return options ?? {};
}

export const createNodesV2: CreateNodesV2<PluginOptions> = [
  combineGlobPatterns([
    '**/tsconfig.app.json',
    '**/Dockerfile'
  ]),
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
  const tree = new FsTree(context.workspaceRoot, false);
  const projectConfiguration = FindProjectByPath(tree, projectPath);
  if (!projectConfiguration) {
    // console.log(`The folder of the file '${ configFilePath }' is not the root of a project. Skipping`.yellow);
    return false;
  }
  if (
    !(
      IsAngularProject(projectConfiguration) ||
      IsNestJsProject(projectConfiguration) ||
      tree.exists(join(projectPath, 'Dockerfile')) ||
      tree.exists(join(projectPath, 'src', 'Dockerfile'))
    ) ||
    !IsApplicationProject(projectConfiguration)
  ) {
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
  const tree = new FsTree(context.workspaceRoot, false);

  targets['docker'] = createDockerBuildTarget(tree, projectPath);
  targets['docker-save'] = createDockerSaveTarget();

  return [
    projectPath, {
      targets,
    },
  ];
}

function createDockerBuildTarget(tree: FsTree, projectPath: string): TargetConfiguration {
  const target: TargetConfiguration = {
    executor: '@rxap/plugin-docker:build',
    dependsOn: [ 'build' ],
  };

  if (tree.exists(join(projectPath, 'Dockerfile'))) {
    target.options ??= {};
    target.options.dockerfile = 'Dockerfile';
  } else if (tree.exists(join(projectPath, 'src', 'Dockerfile'))) {
    target.options ??= {};
    target.options.dockerfile = 'src/Dockerfile';
  }

  return target;
}

function createDockerSaveTarget(): TargetConfiguration {
  return {
    executor: '@rxap/plugin-docker:save',
    dependsOn: [ 'docker' ],
  };
}
