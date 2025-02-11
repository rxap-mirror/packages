import {
  CreateNodesContextV2,
  CreateNodesV2,
  ProjectConfiguration,
  TargetConfiguration,
} from '@nx/devkit';
import {
  FindProjectByPath,
  FsTree,
  GetPackageJson,
  HasPackageJson,
  IsAngularProject,
  IsLibraryProject,
  IsN8NProject,
  IsNestJsProject,
  IsPluginProject,
  IsPublishable,
  IsSchematicProject,
} from '@rxap/workspace-utilities';
import { existsSync } from 'fs';
import { globSync } from 'glob';
import { Optional } from 'nx/src/project-graph/plugins';
import {
  dirname,
  join,
} from 'path';
import 'colors';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PluginOptions {}

export function normalizeOptions(
  options: PluginOptions | undefined
): PluginOptions {
  return options ?? {};
}

export const createNodesV2: CreateNodesV2<PluginOptions> = [
  '**/Kraftfile',
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
  if (!FindProjectByPath(tree, projectPath, true)) {
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
  targets['kraft-cloud-deploy'] = createKraftCloudDeployTarget();
  targets['kraft-cloud-img-remove'] = createKraftCloudImgRemoveTarget();
  targets['kraft-cloud-instance-create'] = createKraftCloudInstanceCreateTarget();
  targets['kraft-cloud-instance-get'] = createKraftCloudInstanceGetTarget();
  targets['kraft-cloud-instance-logs'] = createKraftCloudInstanceLogsTarget();
  targets['kraft-cloud-instance-remove'] = createKraftCloudInstanceRemoveTarget();
  targets['kraft-cloud-instance-start'] = createKraftCloudInstanceStartTarget();
  targets['kraft-cloud-instance-stop'] = createKraftCloudInstanceStopTarget();
  targets['kraft-cloud-tunnel'] = createKraftCloudTunnelTarget();

  return [projectPath, {
    targets
  }];
}

function createKraftCloudDeployTarget(): TargetConfiguration {
  return {
    executor: '@rxap/plugin-kraft:cloud-deploy',
    configurations: {
      development: {
        'scale-to-zero': 'off'
      }
    }
  };
}

function createKraftCloudInstanceRemoveTarget(): TargetConfiguration {
  return {
    executor: '@rxap/plugin-kraft:cloud-instance-remove',
  };
}

function createKraftCloudInstanceCreateTarget(): TargetConfiguration {
  return {
    executor: '@rxap/plugin-kraft:cloud-instance-create',
    options: {
      start: true
    },
    configurations: {
      development: {
        'scale-to-zero': 'off'
      }
    }
  };
}

function createKraftCloudInstanceStartTarget(): TargetConfiguration {
  return {
    executor: '@rxap/plugin-kraft:cloud-instance-start'
  };
}

function createKraftCloudInstanceStopTarget(): TargetConfiguration {
  return {
    executor: '@rxap/plugin-kraft:cloud-instance-stop'
  };
}

function createKraftCloudInstanceGetTarget(): TargetConfiguration {
  return {
    executor: '@rxap/plugin-kraft:cloud-instance-get'
  };
}

function createKraftCloudInstanceLogsTarget(): TargetConfiguration {
  return {
    executor: '@rxap/plugin-kraft:cloud-instance-logs',
    options: {
      follow: true,
      tail: 100
    }
  };
}

function createKraftCloudTunnelTarget(): TargetConfiguration {
  return {
    executor: '@rxap/plugin-kraft:cloud-tunnel',
    options: {
      'tunnel-image': 'official/utils/tunnel:1.0'
    }
  };
}

function createKraftCloudImgRemoveTarget(): TargetConfiguration {
  return {
    executor: '@rxap/plugin-kraft:cloud-img-remove',
  };
}
