import {
  chain,
  Rule,
} from '@angular-devkit/schematics';
import {
  AddNestModuleImport,
  AddNestModuleProvider,
  TsMorphNestProjectTransformRule,
} from '@rxap/schematics-ts-morph';
import {
  AddPackageJsonDependencyRule,
  GetPackageJson,
  GetProjectRoot,
  InstallNodePackages,
} from '@rxap/schematics-utilities';
import { join } from 'path';
import {
  SourceFile,
  Writers,
} from 'ts-morph';
import { SentrySchema } from './schema';

function updateProjectPackageJson(options: SentrySchema): Rule {
  return tree => {
    const projectRoot = GetProjectRoot(tree, options.project);
    const rootPackageJson = GetPackageJson(tree);
    const packageJsonFilePath = join(projectRoot, 'package.json');
    if (!tree.exists(packageJsonFilePath)) {
      tree.create(packageJsonFilePath, '{}');
    }
    const content: any = JSON.parse(tree.read(packageJsonFilePath)?.toString('utf-8') ?? '{}');
    content.dependencies ??= {};
    content.dependencies['@sentry/hub'] ??= rootPackageJson.dependencies!['@sentry/hub'] ?? 'latest';
    tree.overwrite(packageJsonFilePath, JSON.stringify(content, undefined, 2));
  };
}

function CoerceSentryModule(sourceFile: SourceFile, options: SentrySchema) {

  AddNestModuleImport(
    sourceFile,
    'SentryModule',
    [
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
        namedImports: [ 'DetermineEnvironment', 'DetermineRelease' ],
        moduleSpecifier: '@rxap/nest-utilities',
      },
    ],
    w => {
      w.writeLine('SentryModule.forRootAsync(');
      Writers.object({
        imports: '[ ConfigModule ]',
        inject: '[ ConfigService ]',
        useFactory: w1 => {
          w1.write('async (config: ConfigService) => (');
          Writers.object({
            dsn: options.required ? `config.getOrThrow('SENTRY_DSN')` : `config.get('SENTRY_DSN')`,
            enabled: options.required ?
              `config.get('SENTRY_ENABLED', false)` :
              `config.get('SENTRY_DSN') && config.get('SENTRY_ENABLED', false)`,
            environment: `config.get('SENTRY_ENVIRONMENT', DetermineEnvironment(environment))`,
            release: `config.get('SENTRY_RELEASE', DetermineRelease(environment))`,
            serverName: `config.get('SENTRY_SERVER_NAME')`,
            debug: `config.get('SENTRY_DEBUG', false)`,
            tracesSampleRate: `1.0`,
            logLevels: `[ 'error', 'warn' ]`,
            maxValueLength: 'Number.MAX_SAFE_INTEGER',
          })(w1);
          w1.write(')');
        },
      })(w);
      w.write(')');
    },
  );

}

function CoerceSentryInterceptorOptionsProvider(sourceFile: SourceFile) {
  AddNestModuleProvider(
    sourceFile,
    {
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
    [
      {
        namedImports: [ 'SENTRY_INTERCEPTOR_OPTIONS' ],
        moduleSpecifier: '@rxap/nest-sentry',
      },
      {
        namedImports: [ 'HttpException' ],
        moduleSpecifier: '@nestjs/common',
      },
    ],
  );
}

function CoerceAppInterceptorProvider(sourceFile: SourceFile) {
  AddNestModuleProvider(
    sourceFile,
    {
      provide: 'APP_INTERCEPTOR',
      useClass: 'SentryInterceptor',
    },
    [
      {
        namedImports: [ 'APP_INTERCEPTOR' ],
        moduleSpecifier: '@nestjs/core',
      },
      {
        namedImports: [ 'SentryInterceptor' ],
        moduleSpecifier: '@rxap/nest-sentry',
      },
    ],
  );
}

function UpdateAppModule(options: SentrySchema) {

  return TsMorphNestProjectTransformRule(
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

export default function (options: SentrySchema): Rule {

  return () => {

    return chain([
      UpdateAppModule(options),
      AddPackageJsonDependencyRule('@sentry/node', 'latest', { soft: true }),
      AddPackageJsonDependencyRule('@sentry/hub', 'latest', { soft: true }),
      AddPackageJsonDependencyRule('@rxap/nest-sentry', 'latest', { soft: true }),
      // updateProjectPackageJson(options),
      InstallNodePackages(),
    ]);

  };

}
