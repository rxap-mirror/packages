import {
  CreateNodesContextV2,
  CreateNodesV2,
  ProjectConfiguration,
  TargetConfiguration,
} from '@nx/devkit';
import {
  FindProjectByPath,
  FsTree,
} from '@rxap/workspace-utilities';
import { Optional } from 'nx/src/project-graph/plugins';
import { dirname } from 'path';
import 'colors';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PluginOptions {}

export function normalizeOptions(
  options: PluginOptions | undefined
): PluginOptions {
  return options ?? {};
}

export const createNodesV2: CreateNodesV2<PluginOptions> = [
  '**/project.json',
  async (configFilePaths, options, context) => {
    const normalizedOptions = normalizeOptions(options);

    const includedConfigFilePaths = await Promise.all(
      configFilePaths.map(async (configFilePath) => {
        if (
          await shouldHaveProjectConfiguration(
            configFilePath,
            normalizedOptions,
            context
          )
        ) {
          return configFilePath;
        }
        return undefined;
      })
    ).then((configFilePathOrUndefinedList) =>
      configFilePathOrUndefinedList.filter((value) => value !== undefined)
    );

    const results = await Promise.all(
      includedConfigFilePaths.map(async (configFilePath) => {
        const [projectPath, projectConfiguration] =
          await createProjectConfiguration(
            configFilePath,
            normalizedOptions,
            context
          );
        return [configFilePath, projectPath, projectConfiguration] as [
          string,
          string,
          Optional<ProjectConfiguration, 'root'>
        ];
      })
    );

    return results.map(
      ([configFilePath, projectPath, projectConfiguration]) => [
        configFilePath,
        {
          projects: {
            [projectPath]: projectConfiguration,
          },
        },
      ]
    );
  },
];

async function shouldHaveProjectConfiguration(
  configFilePath: string,
  options: PluginOptions,
  context: CreateNodesContextV2
): Promise<boolean> {
  const projectPath = dirname(configFilePath);
  const tree = new FsTree(context.workspaceRoot);
  if (projectPath !== '.') {
    return false;
  }
  if (!FindProjectByPath(tree, projectPath)) {
    // console.log(`The folder of the file '${ configFilePath }' is not the root of a project. Skipping`.yellow);
    return false;
  }
  return true;
}

async function createProjectConfiguration(
  configFilePath: string,
  options: PluginOptions,
  context: CreateNodesContextV2
): Promise<[string, Optional<ProjectConfiguration, 'root'>]> {
  const projectPath = dirname(configFilePath);
  const targets: Record<string, TargetConfiguration> = {};
  const tree = new FsTree(context.workspaceRoot);
  const projectConfiguration = FindProjectByPath(tree, projectPath);

  if (!projectConfiguration) {
    throw new Error(`Could not find project in '${ projectPath }'`);
  }
  targets['ci-info'] = createCiInfoTarget();
  if (tree.exists('docker-compose.yml')) {
    targets['docker-compose'] = createDockerComposeTarget();
  }

  return [projectPath, {
    targets
  }];
}

function createDockerComposeTarget(): TargetConfiguration {
  return {
    executor: '@rxap/plugin-library:run-generator',
    options: {
      generator: '@rxap/plugin-workspace:docker-compose',
      withoutProjectArgument: true,
    },
  };
}

function createCiInfoTarget(): TargetConfiguration {
  return {
    executor: '@rxap/plugin-workspace:ci-info',
    inputs: [
      {
        'env': 'CI_COMMIT_TIMESTAMP',
      },
      {
        'env': 'CI_COMMIT_BRANCH',
      },
      {
        'env': 'CI_COMMIT_TAG',
      },
      {
        'env': 'CI_COMMIT_SHA',
      },
      {
        'env': 'CI_ENVIRONMENT_NAME',
      },
      {
        'env': 'CI_JOB_ID',
      },
      {
        'env': 'CI_PIPELINE_ID',
      },
      {
        'env': 'CI_PROJECT_ID',
      },
      {
        'env': 'CI_RUNNER_ID',
      },
      {
        'env': 'CI_ENVIRONMENT_URL',
      },
      {
        'env': 'CI_ENVIRONMENT_TIER',
      },
      {
        'env': 'CI_ENVIRONMENT_SLUG',
      },
      {
        'env': 'CI_COMMIT_REF_SLUG',
      },
    ],
    outputs: [
      '{workspaceRoot}/dist/**/build.json',
    ],
    cache: true,
  };
}
