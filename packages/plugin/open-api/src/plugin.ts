import {
  CreateNodesContextV2,
  CreateNodesV2,
  ProjectConfiguration,
  TargetConfiguration,
} from '@nx/devkit';
import {
  FindProject,
  FindProjectByPath,
  FsTree,
} from '@rxap/workspace-utilities';
import { existsSync } from 'fs';
import { Optional } from 'nx/src/project-graph/plugins';
import {
  dirname,
  join,
} from 'path';
import 'colors';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PluginOptions {}

export function normalizeOptions(
  options: PluginOptions | undefined,
): PluginOptions {
  return options ?? {};
}

export const createNodesV2: CreateNodesV2<PluginOptions> = [
  '**/tsconfig.lib.json',
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
    // console.log(`The folder of the file '${ configFilePath }' is not the root of a project. Skipping`.yellow);
    return false;
  }
  if (![ 'openapi', 'open-api' ].some((tag) => projectConfiguration.tags?.includes(tag))) {
    return false;
  }
  const projectName = projectConfiguration.name;
  if (!projectName.startsWith('open-api-')) {
    return false;
  }
  const serviceProjectName = projectName.replace(/^open-api-/, '');
  const serviceProjectConfiguration = FindProject(tree, serviceProjectName);
  if (!serviceProjectConfiguration) {
    return false;
  }
  if (!existsSync(join(serviceProjectConfiguration.root, 'src/swagger.ts'))) {
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
  const tree = new FsTree(context.workspaceRoot);
  const projectConfiguration = FindProjectByPath(tree, projectPath)!;
  const projectName = projectConfiguration.name;
  const serviceProjectName = projectName.replace(/^open-api-/, '');
  const serviceProjectConfiguration = FindProject(tree, serviceProjectName)!;
  const serviceProjectRoot = serviceProjectConfiguration.root;

  targets['generate-open-api'] = createGenerateOpenApiTarget(serviceProjectName, serviceProjectRoot);
  targets['build'] = createBuildTarget(projectPath);

  return [
    projectPath, {
      targets,
    },
  ];
}

function createBuildTarget(projectPath: string): TargetConfiguration {
  return {
    executor: '@nx/js:tsc',
    outputs: [
      '{options.outputPath}',
    ],
    options: {
      outputPath: `dist/${projectPath}`,
      main: `${projectPath}/src/index.ts`,
      tsConfig: `${projectPath}/tsconfig.lib.json`,
      assets: [],
      generateExportsField: true,
      additionalEntryPoints: [
        `${projectPath}/src/lib/commands/index.ts`,
        `${projectPath}/src/lib/components/index.ts`,
        `${projectPath}/src/lib/parameters/index.ts`,
        `${projectPath}/src/lib/remote-methods/index.ts`,
        `${projectPath}/src/lib/request-bodies/index.ts`,
        `${projectPath}/src/lib/responses/index.ts`,
      ],
    },
    dependsOn: [
      'generate-open-api',
    ],
  };
}

function createGenerateOpenApiTarget(serviceProjectName: string, serviceProjectRoot: string): TargetConfiguration {
  return {
    dependsOn: [
      {
        projects: serviceProjectName,
        target: 'swagger-generate',
      },
    ],
    executor: '@rxap/plugin-openapi:generate',
    outputs: [ '{projectRoot}/src' ],
    cache: true,
    inputs: [ `{workspaceRoot}/swagger/${ serviceProjectRoot }/openapi.json` ],
    options: {
      path: `swagger/${ serviceProjectRoot }/openapi.json`,
      serverId: serviceProjectName,
    },
  };
}
