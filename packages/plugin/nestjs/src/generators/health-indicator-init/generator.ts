import { Tree } from '@nx/devkit';
import {
  CoerceHealthController,
  CoerceHealthModule,
  CoerceNestModuleController,
  CoerceNestModuleImport,
} from '@rxap/ts-morph';
import { TsMorphNestProjectTransform } from '@rxap/workspace-ts-morph';
import { AddPackageJsonDependency } from '@rxap/workspace-utilities';
import { NESTJS_TERMINUS_VERSION } from '../../lib/nestjs-version';
import { HealthIndicatorInitGeneratorSchema } from './schema';

export async function healthIndicatorInitGenerator(
  tree: Tree,
  options: HealthIndicatorInitGeneratorSchema,
) {
  await TsMorphNestProjectTransform(tree, {
    project: options.project,
    backend: undefined,
  }, (project, [ appModuleSourceFile, moduleSourceFile, controllerSourceFile ]) => {
    CoerceHealthModule(moduleSourceFile);
    // import HealthModule into AppModule
    CoerceNestModuleImport(appModuleSourceFile, {
      moduleName: 'HealthModule',
      moduleSpecifier: './health/health.module',
    });
    CoerceHealthController(controllerSourceFile);
    // import HealthController into HealthModule
    CoerceNestModuleController(moduleSourceFile, {
      name: 'HealthController',
      moduleSpecifier: './health.controller',
    });
  }, [
    '/app/app.module.ts',
    '/app/health/health.module.ts?',
    '/app/health/health.controller.ts?',
  ]);
  await AddPackageJsonDependency(tree, '@nestjs/terminus', NESTJS_TERMINUS_VERSION, { soft: true });
}

export default healthIndicatorInitGenerator;
