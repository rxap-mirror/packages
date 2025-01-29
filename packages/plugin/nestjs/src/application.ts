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
import { existsSync } from 'fs';
import { Optional } from 'nx/src/project-graph/plugins';
import { combineGlobPatterns } from 'nx/src/utils/globs';
import {
  dirname,
  join,
} from 'path';
import 'colors';
import { isLegacyConfiguration } from './generators/init-application/is-legacy-configuration';

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
    '**/src/app/app.controller.ts',
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
  const projectConfiguration = FindProjectByPath(tree, projectPath);
  if (!projectConfiguration) {
    // console.log(`The folder of the file '${ configFilePath }' is not the root of a project. Skipping`.yellow);
    return false;
  }
  if (['ngx', 'angular'].some(tag => projectConfiguration.tags?.includes(tag))) {
    return false;
  }
  if (existsSync(join(projectPath, 'src/index.html'))) {
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
  // only generate the package json if the project is not in the root
  if (['', '/'].includes(projectConfiguration.root)) {
    targets['generate-package-json'] = createGeneratePackageJsonTarget();
  }
  if (existsSync(join(projectPath, 'src/swagger.ts'))) {
    if (isLegacyConfiguration(projectConfiguration)) {
      targets['swagger-build'] = createLegacySwaggerBuildTarget(projectPath);
      targets['swagger-generate'] = createLegacySwaggerGenerateTarget(projectPath);
    } else {
      targets['swagger-generate'] = createSwaggerGenerateTarget(projectPath);
      targets['swagger-build'] = createSwaggerBuildTarget(projectPath);
    }
  }

  return [
    projectPath, {
      targets,
    },
  ];
}

function createGeneratePackageJsonTarget(): TargetConfiguration {
  return {
    cache: true,
    executor: '@rxap/plugin-nestjs:package-json',
    inputs: [ 'production', '^production' ],
    outputs: [ '{projectRoot}/package.json' ],
  };
}

function createSwaggerBuildTarget(projectPath: string): TargetConfiguration {
  return {
    executor: 'nx:run-commands',
    cache: true,
    inputs: [ 'production', '^production' ],
    outputs: [ '{workspaceRoot}/dist/{projectRoot}' ],
    options: {
      command: 'webpack-cli build',
      cwd: projectPath,
      config: 'webpack.config.swagger.js',
      args: [ 'node-env=development' ],
    },
  };
}

function createLegacySwaggerBuildTarget(projectPath: string): TargetConfiguration {
  const target: TargetConfiguration = {
    cache: true,
    executor: '@nx/webpack:webpack',
    outputs: [ '{options.outputPath}' ],
    inputs: [ 'production', '^production' ],
    dependsOn: [ 'build' ],
    options: {
      deleteOutputPath: false,
      outputPath: join('swagger', projectPath),
      main: join(projectPath, 'src/swagger.ts'),
      target: 'node',
      compiler: 'tsc',
      webpackConfig: join(projectPath, 'webpack.config.js'),
      transformers: [ '@nestjs/swagger/plugin' ],
      tsConfig: join(projectPath, 'tsconfig.app.json'),
    },
  };
  if (existsSync(join(projectPath, 'src/environments/environment.swagger.ts'))) {
    target.options.fileReplacements = [{
      replace: join(projectPath, 'src/environments/environment.swagger.ts'),
      with: join(projectPath, 'src/environments/environment.ts'),
    }];
  }
  return target;
}

function createLegacySwaggerGenerateTarget(projectPath: string): TargetConfiguration {
  return {
    cache: true,
    executor: '@rxap/plugin-nestjs:swagger-generate',
    dependsOn: [ 'swagger-build' ],
    outputs: [ '{workspaceRoot}/' + join(`swagger`, projectPath, 'openapi.json') ],
    inputs: [ '{workspaceRoot}/' + join(`swagger`, projectPath, 'main.js') ],
  };
}

function createSwaggerGenerateTarget(projectPath: string): TargetConfiguration {
  return {
    cache: true,
    executor: '@rxap/plugin-nestjs:swagger-generate',
    dependsOn: [ 'swagger-build' ],
    outputs: [ '{workspaceRoot}/' + join(`swagger`, projectPath, 'openapi.json') ],
    inputs: [ '{workspaceRoot}/' + join(`swagger`, projectPath, 'main.js') ],
    defaultConfiguration: 'swagger'
  };
}
