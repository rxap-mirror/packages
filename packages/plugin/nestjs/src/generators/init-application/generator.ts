import {
  formatFiles,
  getProjects,
  ProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nx/devkit';
import {
  ApplicationInitProject,
  ApplicationInitWorkspace,
} from '@rxap/plugin-application';
import {
  CoerceAppGuardProvider,
  CoerceImports,
  CoerceNestAppConfig,
  CoerceNestAppConfigOptionsItem,
  CoerceNestAppController,
  CoerceNestAppModule,
  CoerceNestCacheModuleImport,
  CoerceNestConfigModuleImport,
  CoerceNestEnvironmentProvider,
  CoerceNestModuleImport,
  CoerceNestThrottlerModuleImport,
} from '@rxap/ts-morph';
import {
  CoerceArrayItems,
  DeleteProperties,
} from '@rxap/utilities';
import { TsMorphNestProjectTransform } from '@rxap/workspace-ts-morph';
import {
  AddPackageJsonDependency,
  AddPackageJsonDevDependency,
  CoerceFilesStructure,
  GenerateSerializedSchematicFile,
  GetNestApiPrefix,
  GetProject,
  GetProjectRoot,
  HasProject,
  SkipNonApplicationProject,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import { Project } from 'ts-morph';
import {
  NESTJS_CACHE_MANAGER_VERSION,
  NESTJS_CONFIG_VERSION,
  NESTJS_TERMINUS_VERSION,
  NESTJS_THROTTLE_VERSION,
  NESTJS_VERSION,
} from '../../lib/nestjs-version';
import { SkipNonNestProject } from '../../lib/skip-non-nest-project';
import healthIndicatorInitGenerator from '../health-indicator-init/generator';
import healthIndicatorGenerator from '../health-indicator/generator';
import jwtGenerator from '../jwt/generator';
import openApiGenerator from '../open-api/generator';
import sentryGenerator from '../sentry/generator';
import swaggerGenerator from '../swagger/generator';
import validatorGenerator from '../validator/generator';
import { coerceOpenApiClientSdkLibrary } from './coerce-open-api-client-sdk-library';
import { coerceEnvironmentFiles } from './coerce-environment-files';
import { ExtractExistingConfigValidation } from './extract-existing-config-validation';
import { getPort } from './get-port';
import { initE2eProject } from './init-e2e-project';
import { removeAppControllerSpecFile } from './remove-app-controller-spec-file';
import { removeAppServiceFile } from './remove-app-service-file';
import { InitApplicationGeneratorSchema } from './schema';
import 'colors';
import { setGeneralTargetDefaults } from './set-general-target-defaults';
import { updateApiConfigurationFile } from './update-api-configuration-file';
import { updateGitIgnore } from './update-git-ignore';
import { updateMainFile } from './update-main-file';
import { updateProjectTargets } from './update-project-targets';
import { updateTags } from './update-tags';

function skipProject(
  tree: Tree,
  options: InitApplicationGeneratorSchema,
  project: ProjectConfiguration,
  projectName: string,
) {

  if (options.project === projectName) {
    return false;
  }

  if (SkipNonNestProject(tree, options, project, projectName)) {
    return true;
  }

  if (SkipNonApplicationProject(tree, options, project, projectName)) {
    return true;
  }

  return false;

}

export async function initApplicationGenerator(
  tree: Tree,
  options: InitApplicationGeneratorSchema,
) {
  options.standalone ??= false;
  options.sentry ??= true;
  options.swagger ??= true;
  options.healthIndicator ??= true;
  options.platform ??= 'express';
  options.validator ??= true;
  options.healthIndicatorList ??= [];
  options.port ??= undefined;
  options.apiPrefix ??= options.standalone ? false : undefined;
  options.sentryDsn ??= undefined;
  options.overwrite ??= false;
  options.openApi ??= false;
  options.jwt ??= false;
  options.apiConfigurationFile ??= options.standalone ? undefined : 'shared/service/configuration/latest/config.api.json';
  options.project ??= undefined;
  options.projects ??= [];
  if (options.project) {
    CoerceArrayItems(options.projects, [options.project]);
  }
  console.log('nestjs application init generator:', options);

  await ApplicationInitWorkspace(tree, options);

  console.group('adding nestjs application specific dependencies');

  await AddPackageJsonDependency(tree, '@rxap/nest-server', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@rxap/nest-utilities', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, 'class-validator', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, 'class-transformer', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@rxap/nest-logger', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@rxap/utilities', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@nestjs/terminus', NESTJS_TERMINUS_VERSION, { soft: true });
  await AddPackageJsonDependency(tree, '@nestjs/config', NESTJS_CONFIG_VERSION, { soft: true });
  await AddPackageJsonDependency(tree, '@nestjs/cache-manager', NESTJS_CACHE_MANAGER_VERSION, { soft: true });
  await AddPackageJsonDependency(tree, 'cache-manager', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, 'joi', 'latest', { soft: true });
  await AddPackageJsonDevDependency(tree, '@rxap/plugin-nestjs', 'latest', { soft: true });
  await AddPackageJsonDevDependency(tree, '@rxap/plugin-library', 'latest', { soft: true });
  await AddPackageJsonDevDependency(tree, '@rxap/plugin-open-api', 'latest', { soft: true });
  await AddPackageJsonDevDependency(tree, '@rxap/plugin-nestjs', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@nestjs/throttler', NESTJS_THROTTLE_VERSION, { soft: true });
  await AddPackageJsonDependency(tree, 'cookie-parser', 'latest', { soft: true });
  await AddPackageJsonDevDependency(tree, '@types/cookie-parser', 'latest', { soft: true });
  await AddPackageJsonDevDependency(tree, '@types/csurf', 'latest', { soft: true });
  await AddPackageJsonDevDependency(tree, '@rxap/plugin-application', 'latest', { soft: true });
  await AddPackageJsonDevDependency(tree, '@rxap/plugin-docker', 'latest', { soft: true });
  // needs to be added always as the app.controller uses the decorator @ApiExcludeController
  await AddPackageJsonDependency(tree, '@nestjs/swagger', 'latest', { soft: true });


  console.group('adding feature specific dependencies');

  if (options.sentry) {
    console.log('adding sentry specific dependencies');
    await AddPackageJsonDependency(tree, '@rxap/nest-sentry', 'latest', { soft: true });
  }

  if (options.swagger) {
    console.log('adding swagger specific dependencies');
    await AddPackageJsonDevDependency(tree, '@rxap/json-schema-to-typescript', 'latest', { soft: true });
    if (!options.standalone) {
      console.log('adding swagger specific dependencies for non standalone application');
      await AddPackageJsonDevDependency(tree, '@rxap/workspace-open-api', 'latest', { soft: true });
    }
  }

  if (options.jwt) {
    console.log('adding jwt specific dependencies');
    await AddPackageJsonDependency(tree, '@rxap/nest-jwt', 'latest', { soft: true });
  }

  if (options.openApi) {
    console.log('adding open api specific dependencies');
    await AddPackageJsonDependency(tree, '@rxap/nest-open-api', 'latest', { soft: true });
  }

  switch (options.platform) {

    case 'express':
      console.log('adding express specific dependencies');
      await AddPackageJsonDependency(tree, '@nestjs/platform-express', NESTJS_VERSION, { soft: true });
      await AddPackageJsonDependency(tree, 'helmet', 'latest', { soft: true });
      break;

    case 'fastify':
      console.log('adding fastify specific dependencies');
      await AddPackageJsonDependency(tree, '@nestjs/platform-fastify', 'latest', { soft: true });
      await AddPackageJsonDependency(tree, '@fastify/helmet', 'latest', { soft: true });
      break;

  }

  console.groupEnd();
  console.groupEnd();

  console.log('coerce files structure');

  CoerceFilesStructure(tree, {
    srcFolder: join(__dirname, 'files', 'shared'),
    target: 'shared/nestjs',
    overwrite: options.overwrite,
  });

  setGeneralTargetDefaults(tree, options);

  if (!options.skipProjects) {

    let projects: Map<string, ProjectConfiguration>;

    try {
      projects = getProjects(tree);
    } catch (e: any) {
      throw new Error(`Could not get projects: ${e.message}`);
    }

    for (const [ projectName, project ] of projects.entries()) {

      if (skipProject(tree, options, project, projectName)) {
        continue;
      }

      const projectSourceRoot = project.sourceRoot;

      if (!projectSourceRoot) {
        throw new Error(`Can't find project source root for project ${ projectName }`);
      }

      GenerateSerializedSchematicFile(
        tree,
        GetProjectRoot(tree, projectName),
        '@rxap/plugin-nestjs',
        'init-application',
        DeleteProperties(options, [ 'project', 'projects', 'overwrite', 'skipProjects' ]),
      );

      console.log(`init nestjs application project: ${ projectName }`);

      const port = getPort(tree, options, projectSourceRoot);
      console.log(`Using port '${port}'`);
      const globalApiPrefix = GetNestApiPrefix(tree, options, projectSourceRoot, projectName);
      console.log(`Using api prefix '${globalApiPrefix}'`);

      ApplicationInitProject(tree, projectName, project, options);

      updateProjectTargets(tree, projectName, project, options);
      updateGitIgnore(tree, project, options);
      updateTags(projectName, project, options);
      if (!options.standalone) {
        updateApiConfigurationFile(tree, projectName, globalApiPrefix, options.apiConfigurationFile);
        if (options.swagger) {
          await coerceOpenApiClientSdkLibrary(tree, projectName);
        }
      }

      // apply changes to the project configuration
      updateProjectConfiguration(tree, projectName, project);

      coerceEnvironmentFiles(
        tree,
        {
          project: projectName,
          sentry: options.sentry,
          overwrite: options.overwrite,
        },
      );
      TsMorphNestProjectTransform(
        tree,
        { project: projectName, backend: undefined, },
        (project: Project, [ moduleSourceFile, controllerSourceFile, configSourceFile ]) => {
          CoerceNestAppModule(moduleSourceFile);
          if (!options.sentry) {
            CoerceNestModuleImport(moduleSourceFile, {
              moduleName: 'LoggerModule',
              moduleSpecifier: '@rxap/nest-logger'
            });
          }
          CoerceNestAppController(controllerSourceFile);
          CoerceNestThrottlerModuleImport(moduleSourceFile, { overwrite: options.overwrite });
          CoerceNestConfigModuleImport(moduleSourceFile, { overwrite: options.overwrite });
          CoerceNestCacheModuleImport(moduleSourceFile, { overwrite: options.overwrite });
          CoerceAppGuardProvider(moduleSourceFile);
          CoerceNestEnvironmentProvider(moduleSourceFile);
          const itemList = ExtractExistingConfigValidation(moduleSourceFile);
          for (const item of [
            {
              name: 'PORT',
              type: 'number',
              defaultValue: port.toFixed(0),
            },
            {
              name: 'GLOBAL_API_PREFIX',
              defaultValue: w => w.quote(globalApiPrefix),
            },
            {
              name: 'THROTTLER_TTL',
              defaultValue: '1',
            },
            {
              name: 'THROTTLER_LIMIT',
              defaultValue: '10',
            },
            {
              name: 'COOKIE_SECRET',
              defaultValue: 'GenerateRandomString()',
            },
          ] as Array<CoerceNestAppConfigOptionsItem>) {
            if (!itemList.find(i => i.name === item.name)) {
              itemList.push(item);
            }
          }
          CoerceNestAppConfig(configSourceFile, {
            itemList,
            overwrite: options.overwrite,
          });
          CoerceImports(configSourceFile, {
            namedImports: [ 'GenerateRandomString' ],
            moduleSpecifier: '@rxap/utilities',
          });
        },
        [
          '/app/app.module.ts',
          '/app/app.controller.ts',
          '/app/app.config.ts?',
        ],
      );

      removeAppServiceFile(tree, projectSourceRoot);
      removeAppControllerSpecFile(tree, projectSourceRoot);

      if (options.generateMain) {
        updateMainFile(tree, projectName, options);
      }

      if (options.healthIndicator || options.healthIndicatorList?.length) {
        if (options.healthIndicatorList?.length) {
          for (const healthIndicator of options.healthIndicatorList) {
            await healthIndicatorGenerator(
              tree,
              {
                name: healthIndicator,
                project: projectName,
                overwrite: options.overwrite,
              },
            );
          }
        } else {
          await healthIndicatorInitGenerator(
            tree,
            {
              project: projectName,
              overwrite: options.overwrite,
            },
          );
        }
      }

      if (options.sentry) {
        await sentryGenerator(
          tree,
          {
            project: projectName,
            dsn: options.sentryDsn,
            required: !!options.sentryDsn,
            overwrite: options.overwrite,
          },
        );
      }

      if (options.validator) {
        await validatorGenerator(
          tree,
          {
            project: projectName,
            overwrite: options.overwrite,
          },
        );
      }

      if (options.openApi) {
        await openApiGenerator(
          tree,
          {
            project: projectName,
            overwrite: options.overwrite,
          },
        );
      }

      if (options.jwt) {
        await jwtGenerator(
          tree,
          {
            project: projectName,
            overwrite: options.overwrite,
          },
        );
      }

      if (options.swagger !== false) {
        await swaggerGenerator(
          tree,
          {
            project: projectName,
            overwrite: options.overwrite,
          },
        );
      }

      if (options.standalone) {
        if (HasProject(tree, `${projectName}-e2e`)) {
          const e2eProject = GetProject(tree, `${projectName}-e2e`);
          initE2eProject(tree, `${projectName}-e2e`, e2eProject, options, port);
        }
      }

    }

  }

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

}

export default initApplicationGenerator;
