import {
  chain,
  Rule,
} from '@angular-devkit/schematics';
import { TsMorphNestProjectTransformRule } from '@rxap/schematics-ts-morph';
import {
  AddPackageJsonDependencyRule,
  InstallNodePackages,
} from '@rxap/schematics-utilities';
import { AddHealthEndpoint } from './add-health-endpoint';
import { AddHealthIndicator } from './add-health-indicator';
import { AddToGlobalHealthEndpoint } from './add-to-global-health-endpoint';
import { CoerceHealthController } from './coerce-health-controller';
import { CoerceHealthModule } from './coerce-health-module';
import { HealthIndicatorSchema } from './schema';


export default function (options: HealthIndicatorSchema): Rule {

  return () => {
    return chain([
      TsMorphNestProjectTransformRule({
        project: options.project,
      }, project => {
        CoerceHealthModule(project);
        const controllerSourceFile = CoerceHealthController(project);
        AddHealthIndicator(project, options.name);
        AddHealthEndpoint(controllerSourceFile, options.name);
        AddToGlobalHealthEndpoint(controllerSourceFile, options.name);
      }),
      AddPackageJsonDependencyRule('@nestjs/terminus', 'latest', { soft: true }),
      InstallNodePackages(),
    ]);
  };

}
