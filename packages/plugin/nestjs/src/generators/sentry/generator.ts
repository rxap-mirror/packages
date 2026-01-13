import { Tree } from '@nx/devkit';
import {
  CoerceImports,
  CoerceNestAppConfig,
  CoerceNestModuleImport,
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
          moduleSpecifier: '@sentry/nestjs/setup',
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
      ],
      importWriter: w => w.writeLine('SentryModule.forRoot()'),
    },
  );

  CoerceNestModuleImport(
    sourceFile,
    {
      overwrite: options.overwrite,
      moduleName: 'SentryLoggerModule',
      structures: [
        {
          moduleSpecifier: '@rxap/nest-sentry',
          namedImports: [ 'SentryLoggerModule', 'SentryModuleOptionsFactory' ],
        },
      ],
      importWriter: w => {
        w.writeLine('SentryLoggerModule.registerAsync(');
        Writers.object({
          useClass: 'SentryModuleOptionsFactory',
        })(w);
        w.write(')');
      },
    },
  );

}

function UpdateAppModule(tree: Tree, options: SentryGeneratorSchema) {

  return TsMorphNestProjectTransform(
    tree,
    {
      project: options.project,
      backend: undefined,
    },
    (project, [ sourceFile ]) => {

      CoerceSentryModule(sourceFile, options);

    },
    [ '/app/app.module.ts' ],
  );

}


function UpdateAppConfig(tree: Tree, options: SentryGeneratorSchema, projectName: string) {

  return TsMorphNestProjectTransform(
    tree,
    {
      project: options.project,
      backend: undefined,
    },
    (project, [ sourceFile ]) => {

      CoerceNestAppConfig(sourceFile, {
        expandList: ['sentryValidationSchema'],
        overwrite: options.overwrite,
      });

      CoerceImports(sourceFile, {
        namedImports: [ 'sentryValidationSchema' ],
        moduleSpecifier: '@rxap/nest-sentry',
      });

    },
    [ '/app/app.config.ts?' ],
  );

}

export async function sentryGenerator(
  tree: Tree,
  options: SentryGeneratorSchema,
) {
  await UpdateAppModule(tree, options);
  await UpdateAppConfig(tree, options, options.project);
  await AddPackageJsonDependency(tree, '@sentry/node', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@sentry/nestjs', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@sentry/profiling-node', 'latest', { soft: true });
  await AddPackageJsonDependency(tree, '@rxap/nest-sentry', 'latest', { soft: true });
}

export default sentryGenerator;
