import { Tree } from '@nx/devkit';
import {
  AddHealthEndpoint,
  AddHealthIndicator,
  AddToGlobalHealthEndpoint,
  CoerceNestModuleProvider,
} from '@rxap/ts-morph';
import { dasherize } from '@rxap/utilities';
import { TsMorphNestProjectTransform } from '@rxap/workspace-ts-morph';
import healthIndicatorInitGenerator from '../health-indicator-init/generator';
import { HealthIndicatorGeneratorSchema } from './schema';

export async function healthIndicatorGenerator(
  tree: Tree,
  options: HealthIndicatorGeneratorSchema,
) {
  await healthIndicatorInitGenerator(tree, options);
  TsMorphNestProjectTransform(tree, {
    project: options.project,
  }, (project, [ moduleSourceFile, controllerSourceFile, healthIndiectorSourceFile ]) => {
    AddHealthIndicator(healthIndiectorSourceFile, options.name);
    CoerceNestModuleProvider(moduleSourceFile, {
      providerObject: dasherize(options.name) + 'HealthIndicator',
      moduleSpecifier: `./${ dasherize(options.name) }.health-indicator`,
    });
    AddHealthEndpoint(controllerSourceFile, options.name);
    AddToGlobalHealthEndpoint(controllerSourceFile, options.name);
  }, [
    '/app/health/health.module.ts',
    '/app/health/health.controller.ts',
    `/app/health/${ dasherize(options.name) }.health-indicator.ts`,
  ]);
}

export default healthIndicatorGenerator;
