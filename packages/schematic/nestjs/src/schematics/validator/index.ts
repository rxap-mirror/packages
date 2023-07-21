import {
  chain,
  Rule,
} from '@angular-devkit/schematics';
import {
  AddPackageJsonDependencyRule,
  InstallNodePackages,
} from '@rxap/schematics-utilities';
import { SentrySchema } from '../sentry/schema';

export default function (options: SentrySchema): Rule {

  return () => {

    return chain([
      AddPackageJsonDependencyRule('class-validator', 'latest', { soft: true }),
      AddPackageJsonDependencyRule('class-transformer', 'latest', { soft: true }),
      InstallNodePackages(),
    ]);

  };
}
