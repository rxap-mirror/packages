import {
  apply,
  applyTemplates,
  chain,
  forEach,
  mergeWith,
  move,
  Rule,
  SchematicsException,
  Tree,
  url,
} from '@angular-devkit/schematics';
import {
  AddPackageJsonDependencyRule,
  GetProjectSourceRoot,
  InstallNodePackages,
  UpdateNxJsonRule,
  UpdateProjectConfigurationRule,
} from '@rxap/schematics-utilities';
import { SwaggerSchema } from './schema';

export default function (options: SwaggerSchema): Rule {

  return async (host: Tree) => {

    const projectSourceRoot = GetProjectSourceRoot(host, options.project);

    return chain([
      mergeWith(apply(url('./files'), [
        applyTemplates(options),
        move(projectSourceRoot),
        forEach(entry => {
          if (host.exists(entry.path)) {
            host.overwrite(entry.path, entry.content);
            return null;
          }
          return entry;
        }),
      ])),
      UpdateProjectConfigurationRule(project => {
        project.targets ??= {};
        const build = project.targets['build'];
        if (!build) {
          throw new SchematicsException('The selected project does not have a build target');
        }
        if (!build.options) {
          throw new SchematicsException('The selected project has the build target without options');
        }
        if (!build.options['outputPath']) {
          throw new SchematicsException('The selected project has the build target without the option outputPath');
        }
        if (!build.options['tsConfig']) {
          throw new SchematicsException('The selected project has the build target without the option tsConfig');
        }
        project.targets['swagger-build'] = {
          executor: '@nx/webpack:webpack',
          outputs: [ '{options.outputPath}' ],
          options: {
            outputPath: (build.options['outputPath'] as string).replace('dist/', 'dist/swagger/'),
            main: `${ project.sourceRoot }/swagger.ts`,
            target: `node`,
            compiler: `tsc`,
            webpackConfig: `${ project.root }/webpack.config.js`,
            transformers: [ '@nestjs/swagger/plugin' ],
            tsConfig: build.options['tsConfig'],
            fileReplacements: [
              {
                replace: `${ project.sourceRoot }/environments/environment.ts`,
                with: `${ project.sourceRoot }/environments/environment.swagger.ts`,
              },
            ],
          },
        };
        const outputPath = project.targets['swagger-build'].options.outputPath;
        project.targets['swagger-generate'] = {
          executor: '@nx/js:node',
          outputs: [
            `${ outputPath }/open-api.json`,
          ],
          options: {
            buildTarget: `${ options.project }:swagger-build`,
            watch: false,
          },
        };
      }, { projectName: options.project }),
      UpdateNxJsonRule(nxJson => {
        nxJson.tasksRunnerOptions ??= {};
        nxJson.tasksRunnerOptions['default'] ??= { runner: 'nx-cloud', options: {} };
        nxJson.tasksRunnerOptions['default'].options ??= {};
        nxJson.tasksRunnerOptions['default'].options['cacheableOperations'] ??= [];
        if (!nxJson.tasksRunnerOptions['default'].options['cacheableOperations'].includes('swagger-build')) {
          nxJson.tasksRunnerOptions['default'].options['cacheableOperations'].push('swagger-build');
        }
        if (!nxJson.tasksRunnerOptions['default'].options['cacheableOperations'].includes('swagger-generate')) {
          nxJson.tasksRunnerOptions['default'].options['cacheableOperations'].push('swagger-generate');
        }
      }),
      AddPackageJsonDependencyRule('swagger-ui-express', 'latest', { soft: true }),
      AddPackageJsonDependencyRule('@nestjs/swagger', 'latest', { soft: true }),
      InstallNodePackages(),
    ]);

  };

}
