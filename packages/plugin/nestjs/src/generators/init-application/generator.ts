import {
  formatFiles,
  getProjects,
  ProjectConfiguration,
  readNxJson,
  Tree,
  updateNxJson,
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
  CoerceNestLoggerProvider,
  CoerceNestModuleImport,
  CoerceNestThrottlerModuleImport,
  CoerceVariableDeclaration,
} from '@rxap/ts-morph';
import {
  CoerceArrayItems,
  DeleteProperties,
} from '@rxap/utilities';
import { TsMorphNestProjectTransform } from '@rxap/workspace-ts-morph';
import {
  AddPackageJsonDependency,
  AddPackageJsonDevDependency,
  CoerceAssets,
  CoerceFilesStructure,
  CoerceIgnorePattern,
  CoerceNxJsonCacheableOperation,
  CoerceProjectTags,
  CoerceTarget,
  CoerceTargetDefaultsDependency,
  GenerateSerializedSchematicFile,
  GetNestApiPrefix,
  GetProject,
  GetProjectRoot,
  GetTarget,
  GetWorkspaceName,
  HasProject,
  IsStandaloneWorkspace,
  SkipNonApplicationProject,
  Strategy,
  UpdateJsonFile,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import {
  Project,
  SourceFile,
  SyntaxKind,
  WriterFunction,
  Writers,
} from 'ts-morph';
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
import { ExtractExistingConfigValidation } from './extract-existing-config-validation';
import { initE2eProject } from './init-e2e-project';
import { InitApplicationGeneratorSchema } from './schema';
import 'colors';

function coerceEnvironmentFiles(tree: Tree, options: { project: string, sentry: boolean, overwrite: boolean }) {

  TsMorphNestProjectTransform(
    tree,
    {
      project: options.project,
      backend: undefined,
    },
    (project, [ sourceFile, prodSourceFile ]) => {

      CoerceImports(sourceFile, {
        moduleSpecifier: '@rxap/nest-utilities',
        namedImports: [ 'Environment' ],
      });
      CoerceImports(prodSourceFile, {
        moduleSpecifier: '@rxap/nest-utilities',
        namedImports: [ 'Environment' ],
      });

      let appName = options.project;
      if (IsStandaloneWorkspace(tree)) {
        appName = GetWorkspaceName(tree);
      }

      const baseEnvironment: Record<string, WriterFunction | string> = {
        name: w => w.quote('development'),
        production: 'false',
        app: w => w.quote(appName),
      };

      if (options.sentry) {
        baseEnvironment['sentry'] = Writers.object({
          enabled: 'false',
          debug: 'false',
        });
      }

      const normal = CoerceVariableDeclaration(sourceFile, 'environment', {
        type: 'Environment',
        initializer: Writers.object(baseEnvironment),
      });

      if (options.overwrite) {
        normal.set({ initializer: Writers.object(baseEnvironment) });
      }

      baseEnvironment['name'] = w => w.quote('production');
      baseEnvironment['production'] = 'true';

      if (options.sentry) {
        baseEnvironment['sentry'] = Writers.object({
          enabled: 'true',
          debug: 'false',
        });
      }

      const prod = CoerceVariableDeclaration(prodSourceFile, 'environment', {
        type: 'Environment',
        initializer: Writers.object(baseEnvironment),
      });

      if (options.overwrite) {
        prod.set({ initializer: Writers.object(baseEnvironment) });
      }

    },
    [
      '/environments/environment.ts?',
      '/environments/environment.prod.ts?',
    ],
  );

}

function removeAppServiceFile(tree: Tree, projectSourceRoot: string) {

  const appServiceFilePath = join(projectSourceRoot, 'app', 'app.service.ts');
  if (tree.exists(appServiceFilePath)) {
    const content = tree.read(appServiceFilePath)?.toString('utf-8');
    if (content) {
      if (content.includes('{ message: \'Hello API\' }')) {
        console.warn('Remove the app service file');
        tree.delete(appServiceFilePath);
        if (tree.exists(join(projectSourceRoot, 'app', 'app.service.spec.ts'))) {
          console.warn('Remove the app service spec file');
          tree.delete(join(projectSourceRoot, 'app', 'app.service.spec.ts'));
        } else {
          console.warn('The app service spec file does not exists');
        }
      } else {
        console.warn('The app service file does not contains the default method', content);
      }
    } else {
      console.warn('The app service file does not exists:', appServiceFilePath);
    }
  } else {
    console.warn('The app service file does not exists');
  }

}

function removeAppControllerSpecFile(tree: Tree, projectSourceRoot: string) {
  const appControllerSpecFilePath = join(projectSourceRoot, 'app', 'app.controller.spec.ts');
  if (tree.exists(appControllerSpecFilePath)) {
    if (tree.read(appControllerSpecFilePath)?.toString('utf-8')?.includes('should return "Hello API"')) {
      console.warn('Remove the app controller spec file');
      tree.delete(appControllerSpecFilePath);
    } else {
      console.warn('The app controller spec file does not contains the default test');
    }
  } else {
    console.warn('The app controller spec file does not exists');
  }
}

function skipProject(
  tree: Tree,
  options: InitApplicationGeneratorSchema,
  project: ProjectConfiguration,
  projectName: string,
) {

  if (SkipNonNestProject(tree, options, project, projectName)) {
    return true;
  }

  if (SkipNonApplicationProject(tree, options, project, projectName)) {
    return true;
  }

  return false;

}

function setGeneralTargetDefaults(tree: Tree, options: InitApplicationGeneratorSchema) {
  console.log('updating default targets');

  const nxJson = readNxJson(tree);

  if (!nxJson) {
    throw new Error('No nx.json found');
  }

  if (!options.standalone) {
    CoerceTargetDefaultsDependency(nxJson, 'build', 'generate-package-json');
    CoerceNxJsonCacheableOperation(
      nxJson, 'generate-package-json', 'generate-open-api');
    CoerceTarget(nxJson, 'generate-package-json', {
      executor: '@rxap/plugin-nestjs:package-json',
      configurations: {
        production: {},
      },
    });
    CoerceTargetDefaultsDependency(nxJson, 'generate-open-api', 'swagger-generate');
    CoerceTargetDefaultsDependency(nxJson, 'test', '^generate-open-api');
  }

  updateNxJson(tree, nxJson);
}

function updateProjectTargets(tree: Tree, projectName: string, project: ProjectConfiguration, options: InitApplicationGeneratorSchema) {

  if (!options.standalone) {
    CoerceTarget(project, 'generate-package-json', {});
  }

  const outputPath = project.targets?.build?.options?.outputPath;

  if (!outputPath) {
    throw new Error(`No outputPath found for project ${ projectName }`);
  }

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
        "input": "",
        "glob": "LICENSE",
        "output": "/"
      }
    ]);
    CoerceTarget(project, 'build', buildConfiguration, Strategy.REPLACE);
  }

  if (project.targets?.['docker']) {
    project.targets['docker'].options ??= {};
    project.targets['docker'].options.dockerfile ??= 'shared/nestjs/Dockerfile';
    project.targets['docker'].options.buildArgList ??= [];
    if (options.apiPrefix !== false && !project.targets['docker'].options.buildArgList.some((arg: string) => arg.startsWith('PATH_PREFIX='))) {
      project.targets['docker'].options.buildArgList.push(
        'PATH_PREFIX=REGEX:app/app.config.ts:validationSchema\\[\'GLOBAL_API_PREFIX\'\\]\\s*=\\s*Joi.string\\(\\).default\\(\\s*\'(.+)\',?\\s*\\);');
    }
  }

}

function updateGitIgnore(tree: Tree, project: ProjectConfiguration, options: InitApplicationGeneratorSchema) {
  if (!options.standalone) {
    CoerceIgnorePattern(tree, join(project.root, '.gitignore'), [ 'package.json' ]);
  }
}

function assertOpenApiClientSdkLibrary(
  tree: Tree,
  projectName: string,
) {

  const openApiProjectName = `open-api-${ projectName }`;

  if (!HasProject(tree, openApiProjectName)) {

    // TODO : run the commands on the fly instead of throwing an error

    console.log('Use the command: ' + `nx g @nx/js:library --name ${openApiProjectName} --directory open-api/${projectName} --importPath ${openApiProjectName} --projectNameAndRootFormat as-provided --linter none --minimal --unitTestRunner none --tags open-api --no-publishable --bundler none`.blue);
    console.log('Use the command: ' + `nx g @rxap/plugin-open-api:init-library --project ${openApiProjectName}`.blue);
    throw new Error(`Can't create open api client sdk library for project ${ projectName }`);

  }

}

function getPort(tree: Tree, options: InitApplicationGeneratorSchema, projectSourceRoot: string) {
  if (options.port && options.projects?.length === 1) {
    return options.port;
  }
  if (tree.exists(join(projectSourceRoot, 'app', 'app.config.ts'))) {
    const match = tree.read(join(projectSourceRoot, 'app', 'app.config.ts'))!
      .toString()
      .match(/validationSchema\['PORT'\] = Joi.number\(\).default\((\d+)\);/);
    if (match) {
      return parseInt(match[1]);
    }
  }
  if (tree.exists(join(projectSourceRoot, 'app', 'app.module.ts'))) {
    const match = tree.read(join(projectSourceRoot, 'app', 'app.module.ts'))!
      .toString()
      .match(/PORT: Joi.number\(\).default\((\d+)\)/);
    if (match) {
      return parseInt(match[1]);
    }
  }
  return Math.floor(Math.random() * 1000) + 3000;
}



const MAIN_NEST_APP_OPTIONS_STATEMENT = 'const options: NestApplicationOptions = {};';
const MAIN_BOOTSTRAP_OPTIONS_STATEMENT = 'const bootstrapOptions: Partial<MonolithicBootstrapOptions> = {};';
const MAIN_SERVER_STATEMENT = 'const server = new Monolithic<NestApplicationOptions, NestExpressApplication>(AppModule, environment, options, bootstrapOptions);';
const MAIN_BOOTSTRAP_STATEMENT = 'server.bootstrap().catch((e) => console.error(\'Server bootstrap failed: \' + e.message));';
const MAIN_SETUP_HELMET_STATEMENT = 'server.after(SetupHelmet());';
const MAIN_SETUP_COOKIE_STATEMENT = 'server.after(SetupCookieParser());';
const MAIN_SETUP_CORS_STATEMENT = 'server.after(SetupCors());';

function assertMainStatements(sourceFile: SourceFile) {
  const statements: string[] = [];

  statements.push('const options: NestApplicationOptions = {');
  statements.push('const bootstrapOptions: Partial<MonolithicBootstrapOptions> = {');
  statements.push(
    'const server = new Monolithic<NestApplicationOptions, NestExpressApplication>(AppModule, environment, options, bootstrapOptions);');

  const existingStatements = sourceFile.getStatements().map(s => s.getText()) ?? [];
  for (const statement of statements) {
    if (!existingStatements.includes(statement)) {
      console.error(`Missing statement from nestjs main.ts:  ${ statement }`);
      sourceFile.set({
        statements: [
          MAIN_NEST_APP_OPTIONS_STATEMENT,
          MAIN_BOOTSTRAP_OPTIONS_STATEMENT,
          MAIN_SERVER_STATEMENT,
          MAIN_SETUP_HELMET_STATEMENT,
          MAIN_SETUP_COOKIE_STATEMENT,
          MAIN_SETUP_CORS_STATEMENT,
          MAIN_BOOTSTRAP_STATEMENT,
        ],
      });
      CoerceImports(sourceFile, [
        {
          moduleSpecifier: '@nestjs/common',
          namedImports: [ 'NestApplicationOptions' ],
        },
        {
          moduleSpecifier: '@nestjs/platform-express',
          namedImports: [ 'NestExpressApplication' ],
        },
        {
          moduleSpecifier: '@rxap/nest-server',
          namedImports: [
            'MonolithicBootstrapOptions',
            'Monolithic',
            'SetupHelmet',
            'SetupCookieParser',
            'SetupCors',
          ],
        },
        {
          moduleSpecifier: './app/app.module',
          namedImports: [ 'AppModule' ],
        },
        {
          moduleSpecifier: './environments/environment',
          namedImports: [ 'environment' ],
        },
      ]);
      return;
    }
  }


}

function updateMainFile(
  tree: Tree,
  projectName: string,
  options: InitApplicationGeneratorSchema,
) {

  TsMorphNestProjectTransform(tree, {
    project: projectName,
    backend: undefined,
    // directory: '..' // to move from the apps/demo/src/app folder into the apps/demo/src folder
  }, (project, [ sourceFile ]) => {

    assertMainStatements(sourceFile);

    const importDeclarations = [];
    const statements: string[] = [];

    if (options.validator) {
      importDeclarations.push({
        moduleSpecifier: '@rxap/nest-server',
        namedImports: [ 'ValidationPipeSetup' ],
      });
      statements.push('server.after(ValidationPipeSetup());');
    }

    if (options.swaggerLive) {
      importDeclarations.push({
        moduleSpecifier: '@rxap/nest-server',
        namedImports: [ 'SetupSwagger' ],
      });
      statements.push('server.after(SetupSwagger());');
    }

    CoerceImports(sourceFile, importDeclarations);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const lastStatement = i > 0 ? statements[i - 1] : null;
      const nestStatement = i < statements.length - 1 ? statements[i + 1] : null;
      const existingStatements = sourceFile.getStatements().map(s => s.getText()) ?? [];
      if (!existingStatements.includes(statement)) {
        let index: number;
        if (lastStatement) {
          index = existingStatements.findIndex(s => s.includes(lastStatement)) + 1;
        } else if (nestStatement) {
          index = existingStatements.findIndex(s => s.includes(nestStatement));
        } else {
          index = existingStatements.findIndex(s => s.includes(MAIN_BOOTSTRAP_STATEMENT));
        }
        console.log(`insert statement: ${ statement } at index ${ index }`);
        sourceFile.insertStatements(index, statement);
      }
    }

    if (projectName === 'service-status') {
      const variableDeclaration = CoerceVariableDeclaration(sourceFile, 'bootstrapOptions', { initializer: '{}' });
      const objectLiteralExpression = variableDeclaration.getInitializerIfKindOrThrow(
        SyntaxKind.ObjectLiteralExpression);
      let objectLiteralElementLike = objectLiteralExpression.getProperty('globalPrefixOptions');
      if (!objectLiteralElementLike) {
        objectLiteralElementLike = objectLiteralExpression.addPropertyAssignment({
          name: 'globalPrefixOptions',
          initializer: '{}',
        });
      }
      const gpoPropertyAssigment = objectLiteralElementLike.asKindOrThrow(SyntaxKind.PropertyAssignment);
      const gpoObjectLiteralExpression = gpoPropertyAssigment.getInitializerIfKindOrThrow(
        SyntaxKind.ObjectLiteralExpression);
      let gpoElementLike = gpoObjectLiteralExpression.getProperty('exclude');
      if (!gpoElementLike) {
        gpoElementLike = gpoObjectLiteralExpression.addPropertyAssignment({
          name: 'exclude',
          initializer: `[ '/health(.*)', '/info', '/openapi', '/register' ]`,
        });
      }
    }


  }, [ 'main.ts' ]);

}

function updateTags(projectName: string, project: ProjectConfiguration, options: InitApplicationGeneratorSchema) {
  const tags = [ 'backend', 'nest', 'service' ];

  if (options.sentry) {
    tags.push('sentry');
  }

  if (options.swagger) {
    tags.push('swagger');
  }

  if (options.jwt) {
    tags.push('jwt');
  }

  if (options.healthIndicator) {
    tags.push('health-indicator');
  }

  if (options.openApi) {
    tags.push('openapi');
  }

  if (options.standalone) {
    tags.push('standalone');
  }

  if (options.platform) {
    tags.push(options.platform);
  }

  const match = projectName.match(/service-feature-(.*)/);
  if (match) {
    tags.push(`feature:${ match[1] }`);
  }

  CoerceProjectTags(project, tags);
}

function updateApiConfigurationFile(
  tree: Tree, projectName: string, apiPrefix: string, apiConfigurationFile?: string) {
  if (apiConfigurationFile) {
    UpdateJsonFile(tree, json => {
      json[projectName] = { baseUrl: `/${ apiPrefix }` };
    }, apiConfigurationFile, { create: true });
  }
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
          assertOpenApiClientSdkLibrary(tree, projectName);
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
          CoerceNestLoggerProvider(moduleSourceFile);
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
