import { Tree } from '@nx/devkit';
import {
  CoerceHealthEndpoint,
  CoerceHealthIndicator,
  AddToGlobalHealthEndpoint,
  CoerceNestModuleProvider,
} from '@rxap/ts-morph';
import {
  classify,
  dasherize,
} from '@rxap/utilities';
import { TsMorphNestProjectTransform } from '@rxap/workspace-ts-morph';
import healthIndicatorInitGenerator from '../health-indicator-init/generator';
import { HealthIndicatorGeneratorSchema } from './schema';

export async function healthIndicatorGenerator(
  tree: Tree,
  options: HealthIndicatorGeneratorSchema,
) {
  await healthIndicatorInitGenerator(tree, options);
  await TsMorphNestProjectTransform(tree, {
    project: options.project,
    backend: undefined,
  }, (project, [ moduleSourceFile, controllerSourceFile, healthIndiectorSourceFile ]) => {
    CoerceHealthIndicator(healthIndiectorSourceFile, options.name);
    CoerceNestModuleProvider(moduleSourceFile, {
      providerObject: classify(options.name) + 'HealthIndicator',
      moduleSpecifier: `./${ dasherize(options.name) }.health-indicator`,
    });
    CoerceHealthEndpoint(controllerSourceFile, options.name);
    AddToGlobalHealthEndpoint(controllerSourceFile, options.name);
  }, [
    '/app/health/health.module.ts',
    '/app/health/health.controller.ts',
    `/app/health/${ dasherize(options.name) }.health-indicator.ts?`,
  ]);
}

export default healthIndicatorGenerator;
