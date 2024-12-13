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
    '**/tsconfig.app.json',
    '**/src/main.ts',
    '**/src/app/app.module.ts',
    '**/src/app/app.component.ts',
    '**/src/index.html',
    '**/src/i18n.index.html.hbs'
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
  const tree = new FsTree(context.workspaceRoot);
  if (!FindProjectByPath(tree, projectPath)) {
    // console.log(`The folder of the file '${ configFilePath }' is not the root of a project. Skipping`.yellow);
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
  const projectConfiguration = FindProjectByPath(tree, projectPath);

  if (!projectConfiguration) {
    throw new Error(`Could not find project in '${ projectPath }'`);
  }

  targets['i18n-index-html'] = createI18nIndexHtmlTarget();

  return [
    projectPath, {
      targets,
    },
  ];
}

function createI18nIndexHtmlTarget(): TargetConfiguration {
  return {
    dependsOn: [ "build"],
    executor: "@rxap/plugin-application:i18n",
    outputs: [ "{workspaceRoot}/dist/{projectRoot}/index.html"],
    inputs: [
      "{projectRoot}/i18n.index.html.hbs"
    ],
    cache: true
  };
}
