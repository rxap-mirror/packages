import {
  generateFiles,
  getProjects,
  ProjectConfiguration,
  readNxJson,
  Tree,
  updateNxJson,
  updateProjectConfiguration,
} from '@nx/devkit';
import jsLibraryGenerator from '@nx/js/src/generators/library/library';
import {
  CoerceAssets,
  CoerceIgnorePattern,
  SkipNonApplicationProject,
} from '@rxap/generator-utilities';
import {
  GetTarget,
  GetTargetOptions,
} from '@rxap/plugin-utilities';
import {
  CoerceAppGuardProvider,
  CoerceImports,
  CoerceNestAppConfig,
  CoerceNestAppController,
  CoerceNestAppModule,
  CoerceNestConfigModuleImport,
  CoerceNestEnvironmentProvider,
  CoerceNestLoggerProvider,
  CoerceNestThrottlerModuleImport,
  CoerceVariableDeclaration,
} from '@rxap/ts-morph';
import { TsMorphNestProjectTransform } from '@rxap/workspace-ts-morph';
import {
  AddPackageJsonDependency,
  AddPackageJsonDevDependency,
  CoerceTarget,
  CoerceTargetDefaultsDependency,
  IsRxapRepository,
  Strategy,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import {
  Project,
  WriterFunction,
  Writers,
} from 'ts-morph';
import { SkipNonNestProject } from '../../lib/skip-non-nest-project';
import healthIndicatorInitGenerator from '../health-indicator-init/generator';
import healthIndicatorGenerator from '../health-indicator/generator';
import jwtGenerator from '../jwt/generator';
import openApiGenerator from '../open-api/generator';
import sentryGenerator from '../sentry/generator';
import swaggerGenerator from '../swagger/generator';
import validatorGenerator from '../validator/generator';
import { InitApplicationGeneratorSchema } from './schema';

function coerceEnvironmentFiles(tree: Tree, options: { project: string, sentry: boolean, overwrite: boolean }) {

  TsMorphNestProjectTransform(
    tree,
    {
      project: options.project,
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

      const baseEnvironment: Record<string, WriterFunction | string> = {
        name: w => w.quote('development'),
        production: 'false',
        app: w => w.quote(options.project),
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
    if (tree.read(appServiceFilePath)?.toString('utf-8')?.includes('return { message: \'Hello API\' };')) {
      console.warn('Remove the app service file');
      tree.delete(appServiceFilePath);
      if (tree.exists(join(projectSourceRoot, 'app', 'app.service.spec.ts'))) {
        console.warn('Remove the app service spec file');
        tree.delete(join(projectSourceRoot, 'app', 'app.service.spec.ts'));
      } else {
        console.warn('The app service spec file does not exists');
      }
    } else {
      console.warn('The app service file does not contains the default method');
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

function setGeneralTargetDefaults(tree: Tree) {
  const nxJson = readNxJson(tree);

  CoerceTargetDefaultsDependency(nxJson, 'build', 'generate-package-json');
  CoerceTargetDefaultsDependency(nxJson, 'generate-open-api', 'swagger-generate');

  updateNxJson(tree, nxJson);
}

function updateProjectTargets(project: ProjectConfiguration) {

  CoerceTarget(project, 'generate-package-json', {
    executor: '@rxap/plugin-nestjs:package-json',
    configurations: {
      production: {},
    },
  });

  const outputPath = project.targets?.build?.options?.outputPath;

  if (!outputPath) {
    throw new Error(`No outputPath found for project ${ project.name }`);
  }

  CoerceTarget(project, 'generate-open-api', {
    executor: '@rxap/plugin-library:run-generator',
    options: {
      generator: '@rxap/plugin-open-api:generate',
      options: {
        project: `open-api-${ project.name }`,
        path: `${ outputPath.replace('dist/', 'dist/swagger/') }/openapi.json`,
        serverId: project.name,
      },
    },
  });

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
    },
  }, Strategy.OVERWRITE);

  const buildTargetOptions = GetTargetOptions(GetTarget(project, 'build'));

  buildTargetOptions.assets ??= [];

  CoerceAssets(buildTargetOptions.assets as string[], [
    join(project.sourceRoot!, 'Dockerfile'),
    join(project.sourceRoot!, 'healthcheck.js'),
  ]);

}

function updateGitIgnore(tree: Tree, project: ProjectConfiguration) {
  CoerceIgnorePattern(tree, join(project.root, '.gitignore'), [ 'package.json' ]);
}

async function addDependencies(tree: Tree, options: InitApplicationGeneratorSchema) {

  await AddPackageJsonDependency(tree, '@nestjs/throttler', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, 'cookie-parser', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@nestjs/config', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, 'joi', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@rxap/nest-utilities', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@rxap/nest-server', 'latest', { soft: true });
  await AddPackageJsonDevDependency(tree, '@types/cookie-parser', 'latest', { soft: true });
  await AddPackageJsonDevDependency(tree, '@types/csurf', 'latest', { soft: true });
  await AddPackageJsonDevDependency(tree, '@rxap/plugin-application', 'latest', { soft: true });
  await AddPackageJsonDevDependency(tree, '@rxap/plugin-docker', 'latest', { soft: true });

  switch (options.platform) {

    case 'express':
      await AddPackageJsonDependency(tree, '@nestjs/platform-express', 'latest', { soft: true });
      await AddPackageJsonDependency(tree, 'helmet', 'latest', { soft: true });
      break;

    case 'fastify':
      await AddPackageJsonDependency(tree, '@nestjs/platform-fastify', 'latest', { soft: true });
      await AddPackageJsonDependency(tree, '@fastify/helmet', 'latest', { soft: true });
      break;

  }

}

async function createOpenApiClientSdkLibrary(
  tree: Tree,
  project: ProjectConfiguration,
  projects: Map<string, ProjectConfiguration>,
) {

  const openApiProjectName = `open-api-${ project.name }`;

  if (projects.has(openApiProjectName)) {
    console.log(`Open api client sdk library for project ${ project.name } already exists`);
    return;
  }

  const projectRoot = project.root;
  const fragments = projectRoot.split('/');
  const name = fragments.pop();
  fragments.shift(); // remove the root folder
  const directory = `open-api/${ fragments.join('/') }`;

  try {
    if (IsRxapRepository(tree.root) && projectRoot.startsWith('applications')) {
      console.log('Detected rxap repository and public nest project');
      // // eslint-disable-next-line @typescript-eslint/no-var-requires
      // await require('@nx/angular/src/generators/library/library')(tree, {
      //   name,
      //   directory,
      //   addTailwind: false,
      //   publishable: true,
      //   importPath: `@rxap/${ openApiProjectName }`,
      //   spec: false,
      //   commonModule: false,
      //   addModuleSpec: false,
      //   prefix: 'rxap',
      //   routing: false,
      //   lazy: false,
      //   tags: 'angular,ngx,open-api',
      //   strict: true,
      //   unitTestRunner: UnitTestRunner.None,
      //   skipModule: true,
      //   skipTests: true,
      // });
      // // eslint-disable-next-line @typescript-eslint/no-var-requires
      // await require('@nx/angular/src/generators/library-secondary-entry-point/library-secondary-entry-point')(tree, {
      //   library: openApiProjectName,
      //   name: 'angular',
      // });
      // // eslint-disable-next-line @typescript-eslint/no-var-requires
      // await require('@nx/angular/src/generators/library-secondary-entry-point/library-secondary-entry-point')(tree, {
      //   library: openApiProjectName,
      //   name: 'nest',
      // });
      // // eslint-disable-next-line @typescript-eslint/no-var-requires
      // await (require('@rxap/plugin-library')).LibraryInitGenerator(tree, {
      //   projects: [ openApiProjectName ],
      // });
    } else {
      await jsLibraryGenerator(tree, {
        name,
        directory,
        unitTestRunner: 'none',
        tags: 'open-api',
        buildable: false,
        bundler: 'none',
      });
    }
  } catch (e: any) {
    console.warn(`Can't create open api client sdk library: ${ e.message }`);
    return;
  }

  let tsConfig: any;

  try {
    tsConfig = JSON.parse(tree.read('tsconfig.base.json').toString('utf-8'));
  } catch (e: any) {
    throw new Error(`Can't parse tsconfig.base.json: ${ e.message }`);
  }

  projects = getProjects(tree);

  if (!projects.has(openApiProjectName)) {
    throw new Error(`Can't find project ${ openApiProjectName }`);
  }

  const openApiProjectRoot = projects.get(openApiProjectName)!.root;

  if (IsRxapRepository(tree.root) && projectRoot.startsWith('applications')) {
    tree.write(`${ openApiProjectRoot }/angular/src/index.ts`, 'export {};');
    tree.write(`${ openApiProjectRoot }/nest/src/index.ts`, 'export {};');
  } else {
    delete tsConfig.compilerOptions.paths[`${ directory }/${ name }`];
    tsConfig.compilerOptions.paths[`${ openApiProjectName }/*`] = [ `${ openApiProjectRoot }/src/lib/*` ];
  }

  tree.write('tsconfig.base.json', JSON.stringify(tsConfig, null, 2));
  tree.write(`${ openApiProjectRoot }/src/index.ts`, 'export {};');
  tree.delete(`${ openApiProjectRoot }/src/lib/${ openApiProjectName }.ts`);
  tree.delete(`${ openApiProjectRoot }/README.md`);

}

function getPort(tree: Tree, options: InitApplicationGeneratorSchema, projectSourceRoot: string) {
  if (options.port && options.projects.length === 1) {
    return options.port;
  }
  if (tree.exists(join(projectSourceRoot, 'app', 'app.config.ts'))) {
    const match = tree.read(join(projectSourceRoot, 'app', 'app.config.ts'))
                      .toString()
                      .match(/validationSchema\['PORT'\] = Joi.number\(\).default\((\d+)\);/);
    if (match) {
      return parseInt(match[1]);
    }
  }
  if (tree.exists(join(projectSourceRoot, 'app', 'app.module.ts'))) {
    const match = tree.read(join(projectSourceRoot, 'app', 'app.module.ts'))
                      .toString()
                      .match(/PORT: Joi.number\(\).default\((\d+)\)/);
    if (match) {
      return parseInt(match[1]);
    }
  }
  return Math.floor(Math.random() * 1000) + 3000;
}

function getApiPrefix(
  tree: Tree,
  options: InitApplicationGeneratorSchema,
  projectSourceRoot: string,
  projectName: string,
) {
  if (options.apiPrefix && options.projects.length === 1) {
    return options.apiPrefix;
  }
  if (tree.exists(join(projectSourceRoot, 'app', 'app.config.ts'))) {
    const match = tree.read(join(projectSourceRoot, 'app', 'app.config.ts'))
                      .toString()
                      .match(/validationSchema\['GLOBAL_API_PREFIX'\] = Joi.string\(\).default\('(.+)'\);/);
    if (match) {
      return match[1];
    }
  }
  if (tree.exists(join(projectSourceRoot, 'app', 'app.module.ts'))) {
    const match = tree.read(join(projectSourceRoot, 'app', 'app.module.ts'))
                      .toString()
                      .match(/GLOBAL_API_PREFIX: Joi.string\(\).default\('(.+)'\)/);
    if (match) {
      return match[1];
    }
  }
  return join('api', projectName.replace(/^service-/, ''));
}

export async function initApplicationGenerator(
  tree: Tree,
  options: InitApplicationGeneratorSchema,
) {
  options.sentry ??= true;
  options.swagger ??= true;
  options.healthIndicator ??= true;
  options.platform ??= 'express';
  options.validator ??= true;
  options.healthIndicatorList ??= [];
  options.port ??= undefined;
  options.apiPrefix ??= undefined;
  options.sentryDsn ??= undefined;
  options.overwrite ??= false;
  options.openApi ??= false;
  options.jwt ??= false;
  options.statusRegister ??= true;
  console.log('nestjs application init generator:', options);

  setGeneralTargetDefaults(tree);

  await addDependencies(tree, options);

  const projects = getProjects(tree);

  for (const [ projectName, project ] of projects.entries()) {

    if (skipProject(tree, options, project, projectName)) {
      continue;
    }

    const projectSourceRoot = project.sourceRoot;

    if (!projectSourceRoot) {
      throw new Error(`Can't find project source root for project ${ projectName }`);
    }

    const port = getPort(tree, options, projectSourceRoot);
    const globalApiPrefix = getApiPrefix(tree, options, projectSourceRoot, projectName);

    console.log(`init project: ${ projectName }`);

    generateFiles(tree, join(__dirname, 'files'), project.sourceRoot, {
      ...options,
      projectName,
      tmpl: '',
      port,
      globalApiPrefix,
      statusRegister: projectName === 'service-status' ? false : options.statusRegister,
    });

    updateProjectTargets(project);
    updateGitIgnore(tree, project);
    await createOpenApiClientSdkLibrary(tree, project, projects);

    // apply changes to the project configuration
    updateProjectConfiguration(tree, projectName, project);

    coerceEnvironmentFiles(tree,
      {
        project: projectName,
        sentry: options.sentry,
        overwrite: options.overwrite,
      },
    );
    TsMorphNestProjectTransform(
      tree,
      { project: projectName },
      (project: Project, [ moduleSourceFile, controllerSourceFile, configSourceFile ]) => {
        CoerceNestAppModule(moduleSourceFile);
        CoerceNestAppController(controllerSourceFile);
        CoerceNestThrottlerModuleImport(moduleSourceFile, { overwrite: options.overwrite });
        CoerceNestConfigModuleImport(moduleSourceFile, { overwrite: options.overwrite });
        CoerceAppGuardProvider(moduleSourceFile);
        CoerceNestEnvironmentProvider(moduleSourceFile);
        CoerceNestLoggerProvider(moduleSourceFile);
        const itemList = [
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
        ];
        if (options.statusRegister && projectName !== 'service-status') {
          itemList.push({
            name: 'STATUS_SERVICE_BASE_URL',
            defaultValue: 'environment.production ? \'http://rxap-status-service:3000\' : `https://${process.env.ROOT_DOMAIN ?? \'localhost\'}:8443`',
          });
          CoerceImports(configSourceFile, {
            namespaceImport: 'process',
            moduleSpecifier: 'process',
          });
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

    if (options.healthIndicator || options.healthIndicatorList?.length) {
      if (options.healthIndicatorList?.length) {
        for (const healthIndicator of options.healthIndicatorList) {
          await healthIndicatorGenerator(tree,
            {
              name: healthIndicator,
              project: projectName,
            },
          );
        }
      } else {
        await healthIndicatorInitGenerator(tree, { project: projectName });
      }
    }

    if (options.sentry) {
      await sentryGenerator(tree,
        {
          project: projectName,
          dsn: options.sentryDsn,
          required: !!options.sentryDsn,
          overwrite: options.overwrite,
        },
      );
    }

    if (options.validator) {
      await validatorGenerator(tree, { project: projectName });
    }

    if (options.openApi) {
      await openApiGenerator(tree, { project: projectName });
    }

    if (options.jwt) {
      await jwtGenerator(tree, { project: projectName });
    }

    if (options.swagger !== false) {
      await swaggerGenerator(tree, { project: projectName });
    }

  }
}

export default initApplicationGenerator;
