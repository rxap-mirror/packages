import {
  CreateNodesContextV2,
  CreateNodesV2,
  ProjectConfiguration,
  TargetConfiguration,
} from '@nx/devkit';
import {
  FindProjectByPath,
  FsTree,
  IsRxapRepository,
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
  '**/ng-package.json',
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
    console.log(`The folder of the file '${ configFilePath }' is not the root of a project. Skipping`.yellow);
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

  targets['check-ng-package'] = createCheckNgPackageTarget();

  if (existsSync(join(projectPath, 'tailwind.config.js'))) {
    targets['build-tailwind'] = createBuildTailwindTarget(IsRxapRepository(context.workspaceRoot));
  }

  return [
    projectPath, {
      targets,
    },
  ];
}

function createBuildTailwindTarget(isRxapRepository: boolean): TargetConfiguration {
  const dependsOn: TargetConfiguration['dependsOn'] = [];
  if (isRxapRepository) {
    dependsOn.push({
      target: 'build',
      projects: [ 'browser-tailwind' ],
    });
  }
  return {
    executor: '@rxap/plugin-angular:build-tailwind',
    configurations: {
      production: {
        minify: true,
      },
    },
    dependsOn,
    inputs: [
      '{projectRoot}/**/*.html',
      '{projectRoot}/**/*.scss',
      '{projectRoot}/**/*.css',
    ],
    outputs: [ '{projectRoot}/theme.css' ],
    cache: true,
  };
}

function createCheckNgPackageTarget(): TargetConfiguration {
  return {
    executor: '@rxap/plugin-angular:check-ng-package',
    inputs: [ '{projectRoot}/ng-package.json', '{projectRoot}/package.json' ],
  };
}
