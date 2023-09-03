import { Tree } from '@nx/devkit';
import {
  CoerceHealthController,
  CoerceHealthModule,
  CoerceNestModuleController,
  CoerceNestModuleImport,
} from '@rxap/ts-morph';
import { TsMorphNestProjectTransform } from '@rxap/workspace-ts-morph';
import { AddPackageJsonDependency } from '@rxap/workspace-utilities';
import { HealthIndicatorInitGeneratorSchema } from './schema';

export async function healthIndicatorInitGenerator(
  tree: Tree,
  options: HealthIndicatorInitGeneratorSchema,
) {
  TsMorphNestProjectTransform(tree, {
    project: options.project,
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
  await AddPackageJsonDependency(tree, '@nestjs/terminus', 'latest', { soft: true });
}

export default healthIndicatorInitGenerator;
