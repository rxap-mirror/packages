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
import { InitApplicationGeneratorSchema } from './schema';
import { join } from 'path';

export function updateProjectTargets(
  tree: Tree, projectName: string, project: ProjectConfiguration, options: InitApplicationGeneratorSchema) {

  if (!options.standalone) {
    CoerceTarget(project, 'generate-package-json', {});
  }

  const outputPath = project.targets?.build?.options?.outputPath ?? join('dist', project.root);

  if (options.swagger && !options.standalone) {
    CoerceTarget(project, 'generate-open-api', {
      executor: '@rxap/plugin-library:run-generator',
      options: {
        generator: '@rxap/plugin-open-api:generate',
        options: {
          project: `open-api-${ projectName }`,
          path: `${ outputPath.replace('dist/', 'dist/swagger/') }/openapi.json`,
          serverId: projectName,
        },
      },
    });
  }

  CoerceTarget(project, 'build', {
    options: {
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
