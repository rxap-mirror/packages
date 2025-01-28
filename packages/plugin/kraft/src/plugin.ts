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
  if (!FindProjectByPath(tree, projectPath)) {
    // console.log(`The folder of the file '${ configFilePath }' is not the root of a project. Skipping`.yellow);
    return false;
  }
  if (projectPath === context.workspaceRoot) {
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
  targets['kraft-deploy'] = createKraftDeployTarget();

  return [projectPath, {
    targets
  }];
}

function createKraftDeployTarget(): TargetConfiguration {
  return {
    executor: '@rxap/plugin-kraft:cloud-deploy',
    configurations: {
      development: {
        'scale-to-zero': 'off'
      }
    }
  };
}
