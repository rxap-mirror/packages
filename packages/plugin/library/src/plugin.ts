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
  '**/tsconfig.lib.json',
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
  if (existsSync(join(projectPath, 'README.md.handlebars'))) {
    targets['readme'] = createReadmeTarget(projectPath);
  }

  if (IsLibraryProject(projectConfiguration)) {
    if (!IsPluginProject(projectConfiguration) && !IsN8NProject(projectConfiguration) && projectConfiguration.name !== 'workspace-tools') {
      targets['index-export'] = createIndexExportTarget();
    }

    if (HasPackageJson(tree, projectPath)) {
      const packageJson = GetPackageJson(tree, projectPath);
      if (IsPublishable(tree, projectConfiguration)) {
        if ('nx-migrations' in packageJson) {
          targets['update-package-group'] = createUpdatePackageGroupTarget();
        }
        targets['update-dependencies'] = createUpdateDependenciesTarget();
      }
    }

    if (IsAngularProject(projectConfiguration)) {
      targets['check-version'] = createCheckVersionTarget('@angular/core');
    }
    if (IsPluginProject(projectConfiguration)) {
      targets['check-version'] = createCheckVersionTarget('nx');
    }
    if (IsNestJsProject(projectConfiguration)) {
      targets['check-version'] = createCheckVersionTarget('@nestjs/core');
    }
    if (IsSchematicProject(projectConfiguration)) {
      targets['check-version'] = createCheckVersionTarget('@angular-devkit/schematics');
    }
    if (existsSync(join(projectPath, 'generators.json'))) {
      targets['expose-as-schematic'] = createExposeAsSchematicTarget();
    }
    if (globSync(join(projectPath, 'src/**/*.schema.json'))?.length) {
      targets['index-json-schema'] = createIndexJsonSchemaTarget();
      targets['bundle-json-schema'] = createBundleJsonSchemaTarget();
    }

  }

  return [projectPath, {
    targets
  }];
}

function createIndexJsonSchemaTarget(): TargetConfiguration {
  return {
    inputs: [
      '{projectRoot}/src/**/template.schema.json',
      '{projectRoot}/src/**/*.schema.json',
    ],
    outputs: [
      '{projectRoot}/template.schema.json',
      '{projectRoot}/schematic-input.schema.json',
    ],
    executor: '@rxap/plugin-library:index-json-schema',
    cache: true,
  };
}

function createBundleJsonSchemaTarget(): TargetConfiguration {
  return {
    inputs: [
      '{projectRoot}/src/**/template.schema.json',
      '{projectRoot}/src/**/*.schema.json',
    ],
    outputs: [
      '{projectRoot}/template.schema.json',
      '{projectRoot}/schematic-input.schema.json',
    ],
    executor: '@rxap/plugin-library:bundle-json-schema',
    cache: true,
  };
}

function createExposeAsSchematicTarget(): TargetConfiguration {
  return {
    executor: '@rxap/plugin-library:expose-as-schematic',
    inputs: ['{projectRoot}/generators.json}'],
    outputs: ['{projectRoot}/generators.json}'],
    cache: true,
  };
}

function createCheckVersionTarget(packageName: string): TargetConfiguration {
  return {
    executor: '@rxap/plugin-library:check-version',
    inputs: ['{projectRoot}/package.json', '{workspaceRoot}/package.json'],
    options: { packageName },
    cache: true,
  };
}

function createUpdatePackageGroupTarget(): TargetConfiguration {
  return {
    executor: '@rxap/plugin-library:update-package-group',
    inputs: ['production', '{projectRoot}/package.json'],
    outputs: ['{projectRoot}/package.json'],
    dependsOn: ['update-dependencies', '^update-dependencies']
  };
}

function createUpdateDependenciesTarget(): TargetConfiguration {
  return {
    executor: '@rxap/plugin-library:update-dependencies',
    outputs: ['{projectRoot}/package.json'],
    inputs: ['{workspaceRoot}/package.json', '{projectRoot}/package.json'],
  };
}

function createReadmeTarget(projectPath: string): TargetConfiguration {
  const inputs = ['{projectRoot}/README.md.handlebars'];
  const potentialInputFiles = ['GETSTARTED.md', 'GUIDES.md', 'package.json', 'collection.json', 'generators.json', 'executors.json', 'builders.json'];
  for (const potentialInputFile of potentialInputFiles) {
    if (existsSync(join(projectPath, potentialInputFile))) {
      inputs.push(`{projectRoot}/${ potentialInputFile }`);
    }
  }
  return {
    executor: '@rxap/plugin-library:readme',
    outputs: ['{projectRoot}/README.md'],
    cache: true,
    inputs
  };
}

function createIndexExportTarget(): TargetConfiguration {
  return {
    executor: '@rxap/plugin-library:index-export',
    outputs: ['{projectRoot}/src/index.ts'],
    cache: true,
    inputs: [
      `{projectRoot}/src/lib/**/*.ts`,
      '!{projectRoot}/src/lib/**/*.{spec,stories,cy}.ts',
      '!{projectRoot}/src/index.ts'
    ]
  };
}
