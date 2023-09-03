import { Tree } from '@nx/devkit';
import {
  CoerceImports,
  CoerceNestAppConfig,
  CoerceNestModuleImport,
  CoerceNestModuleProvider,
} from '@rxap/ts-morph';
import { TsMorphNestProjectTransform } from '@rxap/workspace-ts-morph';
import { AddPackageJsonDependency } from '@rxap/workspace-utilities';
import {
  SourceFile,
  Writers,
} from 'ts-morph';
import { SentryGeneratorSchema } from './schema';

function CoerceSentryModule(sourceFile: SourceFile, options: SentryGeneratorSchema) {

  CoerceNestModuleImport(
    sourceFile,
    {
      overwrite: options.overwrite,
      moduleName: 'SentryModule',
      structures: [
        {
          moduleSpecifier: '@rxap/nest-sentry',
          namedImports: [ 'SentryModule' ],
        },
        {
          moduleSpecifier: '@nestjs/config',
          namedImports: [ 'ConfigService', 'ConfigModule' ],
        },
        {
          namedImports: [ 'environment' ],
          moduleSpecifier: '../environments/environment',
        },
        {
          namedImports: [ 'GetLogLevels', 'SentryOptionsFactory' ],
          moduleSpecifier: '@rxap/nest-utilities',
        },
      ],
      importWriter: w => {
        w.writeLine('SentryModule.forRootAsync(');
        Writers.object({
          imports: '[ ConfigModule ]',
          inject: '[ ConfigService ]',
          useFactory: 'SentryOptionsFactory(environment)',
        })(w);
        w.write(',');
        Writers.object({
          logLevels: 'GetLogLevels()',
        })(w);
        w.write(')');
      },
    },
  );

}

function CoerceSentryInterceptorOptionsProvider(sourceFile: SourceFile) {
  CoerceNestModuleProvider(
    sourceFile,
    {
      providerObject: {
        provide: 'SENTRY_INTERCEPTOR_OPTIONS',
        useValue: Writers.object({
          filters: w1 => {
            w1.write('[');
            Writers.object({
              type: 'HttpException',
              filter: '(exception: HttpException) => 500 > exception.getStatus()',
            })(w1);
            w1.write(']');
          },
        }),
      },
      structures: [
        {
          namedImports: [ 'SENTRY_INTERCEPTOR_OPTIONS' ],
          moduleSpecifier: '@rxap/nest-sentry',
        },
        {
          namedImports: [ 'HttpException' ],
          moduleSpecifier: '@nestjs/common',
        },
      ],
    }
  );
}

function CoerceAppInterceptorProvider(sourceFile: SourceFile) {
  CoerceNestModuleProvider(
    sourceFile,
    {
      providerObject: {
        provide: 'APP_INTERCEPTOR',
        useClass: 'SentryInterceptor',
      },
      structures: [
        {
          namedImports: [ 'APP_INTERCEPTOR' ],
          moduleSpecifier: '@nestjs/core',
        },
        {
          namedImports: [ 'SentryInterceptor' ],
          moduleSpecifier: '@rxap/nest-sentry',
        },
      ],
    }
  );
}

function UpdateAppModule(tree: Tree, options: SentryGeneratorSchema) {

  TsMorphNestProjectTransform(
    tree,
    {
      project: options.project,
    },
    (project, [ sourceFile ]) => {

      CoerceSentryModule(sourceFile, options);
      CoerceSentryInterceptorOptionsProvider(sourceFile);
      CoerceAppInterceptorProvider(sourceFile);

    },
    [ '/app/app.module.ts' ],
  );

}


function UpdateAppConfig(tree: Tree, options: SentryGeneratorSchema, projectName: string) {

  TsMorphNestProjectTransform(
    tree,
    {
      project: options.project,
    },
    (project, [ sourceFile ]) => {

      CoerceNestAppConfig(sourceFile, {
        itemList: [
          {
            name: 'SENTRY_DSN',
            defaultValue: options.dsn,
          },
          {
            name: 'SENTRY_ENABLED',
            defaultValue: 'environment.sentry?.enabled ?? false',
          },
          {
            name: 'SENTRY_ENVIRONMENT',
          },
          {
            name: 'SENTRY_RELEASE',
          },
          {
            name: 'SENTRY_SERVER_NAME',
            defaultValue: `process.env.ROOT_DOMAIN ?? '${ projectName }'`,
          },
          {
            name: 'SENTRY_DEBUG',
            defaultValue: 'environment.sentry?.debug ?? false',
          },
        ],
        overwrite: options.overwrite,
      });

      CoerceImports(sourceFile, {
        namedImports: [ 'environment' ],
        moduleSpecifier: '../environments/environment',
      });

    },
    [ '/app/app.config.ts?' ],
  );

}

export async function sentryGenerator(
  tree: Tree,
  options: SentryGeneratorSchema,
) {
  UpdateAppModule(tree, options);
  UpdateAppConfig(tree, options, options.project);
  await AddPackageJsonDependency(tree, '@sentry/node', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@sentry/hub', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@rxap/nest-sentry', 'latest', { soft: true });
}

export default sentryGenerator;
