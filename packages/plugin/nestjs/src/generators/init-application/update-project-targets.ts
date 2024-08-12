import {
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import {
  CoerceAssets,
  CoerceTarget,
  GetTarget,
  Strategy,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import { InitApplicationGeneratorSchema } from './schema';

export function updateProjectTargets(
  tree: Tree, projectName: string, project: ProjectConfiguration, options: InitApplicationGeneratorSchema) {

  if (!options.standalone) {
    CoerceTarget(project, 'generate-package-json', {});
  }

  CoerceTarget(project, 'build', {
    executor: '@nx/webpack:webpack',
    outputs: [ '{options.outputPath}'],
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

  if (project.targets?.['docker']) {
    project.targets['docker'].options ??= {};
    project.targets['docker'].options.dockerfile ??= 'shared/nestjs/Dockerfile';
    project.targets['docker'].options.buildArgList ??= [];
    if (options.apiPrefix !== false &&
        !project.targets['docker'].options.buildArgList.some((arg: string) => arg.startsWith('PATH_PREFIX='))) {
      project.targets['docker'].options.buildArgList.push(
        'PATH_PREFIX=REGEX:app/app.config.ts:validationSchema\\[\'GLOBAL_API_PREFIX\'\\]\\s*=\\s*Joi.string\\(\\).default\\(\\s*\'(.+)\',?\\s*\\);');
    }
  }

}
