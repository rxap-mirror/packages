import {
  CreateNodesContextV2,
  CreateNodesV2,
  ProjectConfiguration,
  TargetConfiguration,
} from '@nx/devkit';
import { FindProjectByPath } from '@rxap/workspace-utilities';
import { FsTree } from 'nx/src/generators/tree';
import { Optional } from 'nx/src/project-graph/plugins';
import { combineGlobPatterns } from 'nx/src/utils/globs';
import { dirname } from 'path';
import 'colors';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PluginOptions {}

export function normalizeOptions(
  options: PluginOptions | undefined,
): PluginOptions {
  return options ?? {};
}

export const createNodesV2: CreateNodesV2<PluginOptions> = [
  combineGlobPatterns([
    '**/*.node.json'
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
  const projectConfiguration = FindProjectByPath(tree, projectPath, true);
  if (!projectConfiguration) {
    // console.log(`The folder of the file '${ configFilePath }' is not the root of a project. Skipping`.yellow);
    return false;
  }
  if (!projectConfiguration.tags?.includes('n8n')) {
    // console.log(`The project ${projectConfiguration.name} does contain a *.node.json file but has not the project tag 'n8n'`);
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
  targets['fix-dependencies'] = createFixDependenciesTarget();
  return [
    projectPath, {
      targets,
    },
  ];
}


function createFixDependenciesTarget(): TargetConfiguration {
  return {
    executor: '@rxap/plugin-library:fix-dependencies',
    inputs: [ "production", "^production" ],
    outputs: [ '{projectRoot}/package.json' ],
    options: {
      onlyDependencies: true,
      peerDependencies: ['n8n-workflow']
    }
  };
}
