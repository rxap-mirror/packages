import {
  apply,
  applyTemplates,
  chain,
  forEach,
  mergeWith,
  move,
  noop,
  Rule,
  SchematicsException,
  Tree,
  url,
} from '@angular-devkit/schematics';
import {
  AddNestModuleController,
  AddNestModuleImport,
  AddNestModuleProvider,
  CoerceDecorator,
  CoerceImports,
  CoerceNestController,
  CoerceNestModule,
  CoerceOperation,
  CoerceVariableDeclaration,
  RemoveNestModuleProvider,
  TsMorphNestProjectTransformRule,
} from '@rxap/schematics-ts-morph';
import {
  AddPackageJsonDependencyRule,
  AddPackageJsonDevDependencyRule,
  ExecuteExternalSchematic,
  ExecuteSchematic,
  GetPackageJson,
  GetProjectRoot,
  GetProjectSourceRoot,
  InstallNodePackages,
  UpdateProjectConfigurationRule,
} from '@rxap/schematics-utilities';
import { join } from 'path';
import {
  SourceFile,
  WriterFunction,
  WriterFunctionOrValue,
  Writers,
} from 'ts-morph';
import { InitSchema } from './schema';

function AddThrottlerModuleImport(sourceFile: SourceFile) {
  AddNestModuleImport(
      sourceFile,
      'ThrottlerModule',
      [
        {
          moduleSpecifier: '@nestjs/throttler',
          namedImports: [ 'ThrottlerModule' ],
        },
      ],
      w => {
        w.writeLine('ThrottlerModule.forRoot(');
        Writers.object({
          ttl: '1',
          limit: '10',
        })(w);
        w.write(')');
      },
  );
}

function AddConfigModuleImport(sourceFile: SourceFile, options: InitSchema) {
  AddNestModuleImport(
      sourceFile,
      'ConfigModule',
      [
        {
          moduleSpecifier: '@nestjs/config',
          namedImports: [ 'ConfigModule' ],
        },
        {
          moduleSpecifier: 'joi',
          namespaceImport: 'Joi',
        },
        ...(options.sentry ? [
          {
            moduleSpecifier: '@rxap/nest-utilities',
            namedImports: [ 'DetermineRelease', 'DetermineEnvironment' ],
          },
        ] : []),
      ],
      w => {
        w.writeLine('ConfigModule.forRoot(');
        Writers.object({
          isGlobal: 'true',
          validationSchema: w1 => {
            w1.write(' Joi.object(');
            const obj: Record<string, WriterFunctionOrValue | undefined> = {
              PORT: `Joi.number().default(${ options.port })`,
              GLOBAL_API_PREFIX: `Joi.string()${ options.apiPrefix ?
                `.default('${ options.apiPrefix }')` :
                '.optional()' }`,
            };
            if (options.sentry) {
              obj['SENTRY_DSN'] =
                `Joi.string()${ options.sentryDsn ? `.default('${ options.sentryDsn }')` : '.optional()' }`;
              obj['SENTRY_ENABLED'] = 'Joi.string().default(environment.sentry?.enabled ?? false)';
              obj['SENTRY_ENVIRONMENT'] = 'Joi.string()';
              obj['SENTRY_RELEASE'] = 'Joi.string()';
              obj['SENTRY_SERVER_NAME'] = `Joi.string().default(process.env.ROOT_DOMAIN ?? '${ options.project }')`;
              obj['SENTRY_DEBUG'] = 'Joi.string().default(environment.sentry?.debug ?? false)';
            }
            Writers.object(obj)(w1);
            w1.write(')');
          },
        })(w);
        w.write(')');
      },
  );
}

function AddAppGuardProvider(sourceFile: SourceFile) {
  AddNestModuleProvider(
      sourceFile,
      {
        provide: 'APP_GUARD',
        useClass: 'ThrottlerGuard',
      },
      [
        {
          namedImports: [ 'APP_GUARD' ],
          moduleSpecifier: '@nestjs/core',
        },
        {
          namedImports: [ 'ThrottlerGuard' ],
          moduleSpecifier: '@nestjs/throttler',
        },
      ],
  );
}

function AddEnvironmentProvider(sourceFile: SourceFile) {
  AddNestModuleProvider(
      sourceFile,
      {
        provide: 'ENVIRONMENT',
        useValue: 'environment',
      },
      [
        {
          namedImports: [ 'ENVIRONMENT' ],
          moduleSpecifier: '@rxap/nest-utilities',
        },
        {
          namedImports: [ 'environment' ],
          moduleSpecifier: '../environments/environment',
        },
      ],
  );
}

function AddLoggerProvider(sourceFile: SourceFile) {
  AddNestModuleProvider(
      sourceFile,
      'Logger',
      [
        {
          namedImports: [ 'Logger' ],
          moduleSpecifier: '@nestjs/common',
        },
      ],
  );
}

/**
 * @deprecated removed
 */
function AddWarmupController(sourceFile: SourceFile) {
  AddNestModuleController(
    sourceFile,
    'WarmupController',
    [
      {
        namedImports: [ 'WarmupController' ],
        moduleSpecifier: '@rxap/nest-google',
      },
    ],
  );
}

function UpdateAppModule(options: InitSchema): Rule {

  return TsMorphNestProjectTransformRule(
    {
      project: options.project,
    },
    (project, [ sourceFile ]) => {

      AddThrottlerModuleImport(sourceFile);
      AddConfigModuleImport(sourceFile, options);
      AddAppGuardProvider(sourceFile);
      AddEnvironmentProvider(sourceFile);
      AddLoggerProvider(sourceFile);
      if (options.google) {
        AddWarmupController(sourceFile);
      }
    },
    [ '/app/app.module.ts' ],
  );

}

/**
 * @deprecated removed
 */
function AddGooglePackages() {
  return chain([
    AddPackageJsonDependencyRule('@google-cloud/logging-winston', 'latest', { soft: true }),
    AddPackageJsonDependencyRule('winston', 'latest', { soft: true }),
    AddPackageJsonDependencyRule('nest-winston', 'latest', { soft: true }),
  ]);
}

function AddExpressPackages() {
  return chain([
    AddPackageJsonDependencyRule('@nestjs/platform-express', 'latest', { soft: true }),
    AddPackageJsonDependencyRule('helmet', 'latest', { soft: true }),
  ]);
}

function AddFastifyPackages() {
  return chain([
    AddPackageJsonDependencyRule('@nestjs/platform-fastify', 'latest', { soft: true }),
    AddPackageJsonDependencyRule('@fastify/helmet', 'latest', { soft: true }),
  ]);
}

function AddPackages(options: InitSchema) {
  const addPackageRules: Rule[] = [];

  if (options.google) {
    addPackageRules.push(AddGooglePackages());
  }

  switch (options.platform) {
    case 'express':
      addPackageRules.push(AddExpressPackages());
      break;
    case 'fastify':
      addPackageRules.push(AddFastifyPackages());
      break;
    default:
      throw new SchematicsException('The underlying platform is not specified');
  }
  return chain([
    ...addPackageRules,
    AddPackageJsonDependencyRule('@nestjs/throttler', 'latest', { soft: true }),
    AddPackageJsonDependencyRule('cookie-parser', 'latest', { soft: true }),
    AddPackageJsonDependencyRule('@nestjs/config', 'latest', { soft: true }),
    AddPackageJsonDependencyRule('joi', 'latest', { soft: true }),
    AddPackageJsonDependencyRule('@rxap/nest-utilities', 'latest', { soft: true }),
    AddPackageJsonDependencyRule('@rxap/nest-server', 'latest', { soft: true }),
    AddPackageJsonDevDependencyRule('@types/cookie-parser', 'latest', { soft: true }),
    AddPackageJsonDevDependencyRule('@types/csurf', 'latest', { soft: true }),
    AddPackageJsonDevDependencyRule('@rxap/plugin-application', 'latest', { soft: true }),
    AddPackageJsonDevDependencyRule('@rxap/plugin-docker', 'latest', { soft: true }),
    () => console.log('Install node packages ...'),
    InstallNodePackages(),
  ]);
}

function RemoveAppService(options: { project: string }): Rule {
  return chain([
    tree => {
      const projectSourceRoot = GetProjectSourceRoot(tree, options.project);
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
    },
    CoerceNestModule({
      project: options.project,
      name: 'app',
      tsMorphTransform: (_, sourceFile) => {
        sourceFile.getImportDeclaration('./app.service')?.remove();
        RemoveNestModuleProvider(sourceFile, 'AppService');
      },
    }),
  ]);
}

function RemoveAppControllerSpec(options: { project: string }): Rule {
  return chain([
    tree => {
      const projectSourceRoot = GetProjectSourceRoot(tree, options.project);
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
    },
  ]);
}

export function CleanUp(options: { project: string }) {
  return chain([
    () => console.log('Clean up ...'),
    RemoveAppService(options),
    RemoveAppControllerSpec(options),
  ]);
}

function CoerceAppController(options: { project: string }) {

  return chain([
    CoerceNestController({
      project: options.project,
      name: 'app',
      nestModule: 'app',
      tsMorphTransform: (_, sourceFile, classDeclaration) => {
        CoerceDecorator(classDeclaration, 'Public', { arguments: [] });
        CoerceImports(sourceFile, {
          moduleSpecifier: '@rxap/nest-utilities',
          namedImports: [ 'Public' ],
        });
        classDeclaration.getMethod('getData')?.remove();
        const [ constructorDeclaration ] = classDeclaration.getConstructors();
        constructorDeclaration.getParameter('appService')?.remove();
        if (constructorDeclaration.getParameters().length === 0) {
          constructorDeclaration.remove();
        }
        sourceFile.getImportDeclaration('./app.service')?.remove();
      },
    }),
    CoerceOperation({
      project: options.project,
      controllerName: 'app',
      nestModule: 'app',
      operationName: 'environment',
      tsMorphTransform: (_, sourceFile) => {
        CoerceImports(sourceFile, [
          {
          moduleSpecifier: '../environments/environment',
          namedImports: [ 'environment' ],
          }, {
            moduleSpecifier: '@rxap/nest-utilities',
            namedImports: [ 'Environment' ],
          },
        ]);
        return ({
          returnType: 'Environment',
          statements: [ 'return environment;' ],
        });
      },
    }),
  ]);

}

function CoerceAppModule(options: { project: string }) {

  return chain([
    CoerceNestModule({
      project: options.project,
      name: 'app',
    }),
  ]);

}

function CoerceEnvironmentFiles(options: { project: string, sentry: boolean }) {

  return chain([
    TsMorphNestProjectTransformRule(
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
        };

        if (options.sentry) {
          baseEnvironment['sentry'] = Writers.object({
            enabled: 'false',
            debug: 'false',
          });
        }

        CoerceVariableDeclaration(sourceFile, 'environment', {
          type: 'Environment',
          initializer: Writers.object(baseEnvironment),
        });

        baseEnvironment['name'] = w => w.quote('production');
        baseEnvironment['production'] = 'true';

        if (options.sentry) {
          baseEnvironment['sentry'] = Writers.object({
            enabled: 'true',
            debug: 'false',
          });
        }

        CoerceVariableDeclaration(prodSourceFile, 'environment', {
          type: 'Environment',
          initializer: Writers.object(baseEnvironment),
        });

      },
      [
        '/environments/environment.ts?',
        '/environments/environment.prod.ts?',
      ],
    ),
  ]);

}

function updateProjectPackageJson(options: InitSchema): Rule {
  return (tree: Tree) => {
    const projectRoot = GetProjectRoot(tree, options.project);
    const rootPackageJson = GetPackageJson(tree);
    const packageJsonFilePath = join(projectRoot, 'package.json');
    if (!tree.exists(packageJsonFilePath)) {
      tree.create(packageJsonFilePath, '{}');
    }
    const content: any = JSON.parse(tree.read(packageJsonFilePath)?.toString('utf-8') ?? '{}');
    content.dependencies ??= {};
    content.dependencies.joi ??=
      (rootPackageJson.dependencies ? rootPackageJson.dependencies['joi'] : undefined) ?? 'latest';
    tree.overwrite(packageJsonFilePath, JSON.stringify(content, undefined, 2));
  };
}

function writeFiles(options: InitSchema): Rule {
  return tree => {
    const projectSourceRoot = GetProjectSourceRoot(tree, options.project);
    return mergeWith(apply(url('./files'), [
      applyTemplates(options),
      move(projectSourceRoot),
      forEach(entry => {
        if (tree.exists(entry.path)) {
          if (options.overwrite) {
            tree.overwrite(entry.path, entry.content);
          }
          return null;
        }
        return entry;
      }),
    ]));
  };
}

function updateProjectTargets(options: InitSchema) {
  return chain([
    UpdateProjectConfigurationRule(
      project => {
        project.targets ??= {};
        const buildTarget = project.targets['build'];
        if (!buildTarget) {
          throw new SchematicsException(`The build target is not defined for the project ${ options.project }`);
        }
        buildTarget.options ??= {};
        buildTarget.options['generatePackageJson'] = true;
        buildTarget.options['assets'] ??= [];
        const assets = buildTarget.options['assets'] as string[];
        const dockerfilePath = join(project.sourceRoot!, 'Dockerfile');
        if (!assets.includes(dockerfilePath)) {
          assets.push(dockerfilePath);
        }
        const healthcheckPath = join(project.sourceRoot!, 'healthcheck.js');
        if (!assets.includes(healthcheckPath)) {
          assets.push(healthcheckPath);
        }
      },
      {
        projectName: options.project,
      },
    ),
  ]);
}

export default function (options: InitSchema): Rule {

  return async () => {

    if (options.healthIndicatorList?.length) {
      options.healthIndicator = true;
    }

    options.pluginBuildInfoOptions ??= {};
    options.pluginDockerOptions ??= {};

    options.pluginBuildInfoOptions['project'] = options.project;
    options.pluginDockerOptions['project'] = options.project;

    console.log('Init options', options);

    return chain([
      CleanUp(options),
      () => console.log('Write template files ...'),
      writeFiles(options),
      () => console.log('Coerce the AppModule Class ...'),
      CoerceAppModule(options),
      () => console.log('Coerce the AppController Class ...'),
      CoerceAppController(options),
      () => console.log('Update the AppModule Class ...'),
      UpdateAppModule(options),
      () => console.log('Coerce the Environment files ...'),
      CoerceEnvironmentFiles(options),
      () => console.log('Update the project configuration ...'),
      updateProjectTargets(options),
      () => console.log('Add npm packages ...'),
      AddPackages(options),
      // updateProjectPackageJson(options),
      options.healthIndicator ? () => {
        console.log('Add the health indicator ...');
        if (options.healthIndicatorList?.length) {
          return chain(options.healthIndicatorList.map(name => ExecuteSchematic(
            'health-indicator',
            { project: options.project, name },
          )));
        } else {
          return ExecuteSchematic('health-indicator-init', { project: options.project });
        }
      } : noop(),
      options.sentry ? ExecuteSchematic('sentry', { project: options.project, required: !!options.sentryDsn }) : noop(),
      options.validator ? ExecuteSchematic('validator', { project: options.project }) : noop(),
      options.swagger ? ExecuteSchematic('swagger', { project: options.project }) : noop(),
      options.openApi ? ExecuteSchematic('open-api', { project: options.project }) : noop(),
      options.jwt ? ExecuteSchematic('jwt', { project: options.project }) : noop(),
      ExecuteExternalSchematic(
        '@rxap/plugin-application',
        'init',
        {
          projects: [ options.project ],
          dockerImageName: options.pluginDockerOptions.imageName,
          dockerImageSuffix: options.pluginDockerOptions.imageSuffix,
          dockerImageRegistry: options.pluginDockerOptions.imageRegistry,
        },
      ),
    ]);

  };

}
