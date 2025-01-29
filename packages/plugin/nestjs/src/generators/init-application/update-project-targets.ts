import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  CoerceAssets,
  CoerceTarget,
  GetTarget,
  HasTarget,
  Strategy,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import { isLegacyConfiguration } from './is-legacy-configuration';
import { InitApplicationGeneratorSchema } from './schema';

export function updateLegacyProjectTargets(
  tree: Tree, projectName: string, project: ProjectConfiguration, options: InitApplicationGeneratorSchema) {
  CoerceTarget(project, 'build', {
    executor: '@nx/webpack:webpack',
    outputs: [ '{options.outputPath}' ],
    defaultConfiguration: 'production',
    options: {
      target: 'node',
      compiler: 'tsc',
      outputPath: join('dist', project.root),
      main: join(project.root, 'src/main.ts'),
      tsConfig: join(project.root, 'tsconfig.app.json'),
      assets: [ join(project.root, 'src/assets') ],
      isolatedConfig: true,
      webpackConfig: join(project.root, 'webpack.config.js'),
      generatePackageJson: true,
    },
    configurations: {
      production: {
        fileReplacements: [
          {
            replace: `${ project.sourceRoot }/environments/environment.ts`,
            with: `${ project.sourceRoot }/environments/environment.prod.ts`,
          },
        ],
      },
      development: {
        progress: true,
      },
    },
  }, Strategy.OVERWRITE);

  if (tree.exists('LICENSE')) {
    const buildConfiguration = GetTarget(project, 'build');
    buildConfiguration.options ??= {};
    buildConfiguration.options.assets ??= [];
    CoerceAssets(buildConfiguration.options.assets, [
      {
        'input': '',
        'glob': 'LICENSE',
        'output': '/',
      },
    ]);
    CoerceTarget(project, 'build', buildConfiguration, Strategy.REPLACE);
  }
}

export function updateProjectTargets(
  tree: Tree, projectName: string, project: ProjectConfiguration, options: InitApplicationGeneratorSchema) {

  if (isLegacyConfiguration(project)) {
    updateLegacyProjectTargets(tree, projectName, project, options);
  } else {
    CoerceTarget(project, 'build', {
      configurations: {
        development: {
          config: 'webpack.config.dev.js',
        },
      },
    }, Strategy.OVERWRITE);
  }

  if (HasTarget(project, 'docker')) {
    if (options.apiPrefix !== false &&
        !GetTarget(project, 'docker').options.buildArgList?.some((arg: string) => arg.startsWith('PATH_PREFIX='))) {
      CoerceTarget(project, 'docker', {
        options: {
          buildArgList: ['PATH_PREFIX=REGEX:app/app.config.ts:validationSchema\\[\'GLOBAL_API_PREFIX\'\\]\\s*=\\s*Joi.string\\(\\).default\\(\\s*\'(.+)\',?\\s*\\);']
        }
      }, Strategy.MERGE);
    }
  }

}
