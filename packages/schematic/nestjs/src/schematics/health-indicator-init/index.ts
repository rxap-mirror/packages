import {
  chain,
  Rule,
} from '@angular-devkit/schematics';
import { TsMorphNestProjectTransformRule } from '@rxap/schematics-ts-morph';
import {
  AddPackageJsonDependencyRule,
  InstallNodePackages,
} from '@rxap/schematics-utilities';
import { CoerceHealthController } from '../health-indicator/coerce-health-controller';
import { CoerceHealthModule } from '../health-indicator/coerce-health-module';
import { HealthIndicatorInitSchema } from './schema';


export default function (options: HealthIndicatorInitSchema): Rule {

  return () => {
    return chain([
      TsMorphNestProjectTransformRule({
        project: options.project,
      }, project => {
        CoerceHealthModule(project);
        CoerceHealthController(project);
      }),
      AddPackageJsonDependencyRule('@nestjs/terminus', 'latest', { soft: true }),
      InstallNodePackages(),
    ]);
  };

}
