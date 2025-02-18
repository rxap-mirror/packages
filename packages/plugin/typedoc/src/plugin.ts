import {
  CreateNodesContextV2,
  CreateNodesV2,
  getProjects,
  ProjectConfiguration,
  TargetConfiguration,
} from '@nx/devkit';
import {
  FindProjectByPath,
  GetProjectRoot,
  GetProjectSourceRoot,
  GetRootPackageJson,
  HasWorkspaceProject,
  IsLibraryProject,
  IsStandaloneWorkspace,
  IsWorkspaceProject,
  ProjectJson,
  SearchFile,
} from '@rxap/workspace-utilities';
import { unique } from '@rxap/utilities';
import { Optional } from 'nx/src/project-graph/plugins';
import { dirname, join } from 'path';
import 'colors';
import { FsTree } from 'nx/src/generators/tree';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PluginOptions {}

export function normalizeOptions(
  options: PluginOptions | undefined,
): PluginOptions {
  return options ?? {};
}

export const createNodesV2: CreateNodesV2<PluginOptions> = [
  '**/tsconfig.typedoc.json',
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
  const tree = new FsTree(context.workspaceRoot, false);
  const projectConfiguration = FindProjectByPath(tree, projectPath);

  if (!projectConfiguration) {
    throw new Error(`Could not find project in '${ projectPath }'`);
  }

  targets['typedoc'] = createTypedocTarget(tree, projectConfiguration);

  return [
    projectPath, {
      targets,
    },
  ];
}

function findTsConfigOption(tree: FsTree, { root }: ProjectJson): string {
  if (tree.exists(join(root, 'tsconfig.typedoc.json'))) {
    return join(root, 'tsconfig.typedoc.json');
  }
  if (tree.exists(join(root, 'tsconfig.lib.json'))) {
    return join(root, 'tsconfig.lib.json');
  }
  if (tree.exists(join(root, 'tsconfig.json'))) {
    return join(root, 'tsconfig.json');
  }
  throw new Error(`Could not find a tsconfig.*.json or tsconfig.json in the project root: '${root}'`);
}

function findEntryPoints(tree: FsTree, projectConfiguration: ProjectJson): string[] {
  const { root } = projectConfiguration;
  if (IsStandaloneWorkspace(tree)) {
    return [ join(root, 'src/index.ts') ];
  }
  if (IsWorkspaceProject(projectConfiguration)) {
    const entryPoints: string[] = [];
    for (const { path } of SearchFile(tree, undefined, path => path.endsWith('tsconfig.typedoc.json'))) {
      const folder = dirname(path);
      if (tree.exists(join(folder, 'src/index.ts'))) {
        entryPoints.push(join(folder, 'src/index.ts'));
      }
    }
    return entryPoints.filter(unique());
  } else {
    if (!tree.exists(join(root, 'src/index.ts'))) {
      throw new Error(`The project ${projectConfiguration.name} has a tsconfig.typedoc.json but not a 'src/index.ts' (${projectConfiguration.root})`);
    }
    return [ join(root, 'src/index.ts') ];
  }
}

function createTypedocTarget(tree: FsTree, projectConfiguration: ProjectJson): TargetConfiguration {
  const options: Record<string, any> = {};

  options['tsconfig'] = findTsConfigOption(tree, projectConfiguration);
  options['entryPoints'] = findEntryPoints(tree, projectConfiguration);
  options['json'] = true;
  options['html'] = true;
  const packageJson = GetRootPackageJson(tree);
  options['markdown'] = 'typedoc-plugin-markdown' in packageJson.devDependencies;
  options['wiki'] = 'typedoc-plugin-markdown' in packageJson.devDependencies && 'typedoc-github-wiki-theme' in packageJson.devDependencies;
  options['skipErrorChecking'] = true;
  options['includeVersion'] = true;

  return {
    executor: '@rxap/plugin-typedoc:build',
    inputs: [ "production", "^production" ],
    outputs: [ '{projectRoot}/docs' ],
    cache: true,
    options
  };
}
