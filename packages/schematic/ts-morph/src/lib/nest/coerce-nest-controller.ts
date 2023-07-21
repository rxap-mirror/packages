import {
  chain,
  externalSchematic,
  Rule,
  SchematicsException,
} from '@angular-devkit/schematics';
import { CoerceNestModule } from './coerce-nest-module';
import { CoerceNestServiceProject } from './coerce-nest-service-project';
import { HasNestController } from './has-nest-controller';
import { buildNestProjectName } from './project-utilities';

export interface CoerceNestControllerOptions {
  project: string;
  feature?: string;
  shared?: boolean;
  name: string;
  nestModule: string;
}

export function CoerceNestController(
  options: CoerceNestControllerOptions,
): Rule {
  const {
    name,
    nestModule,
    project,
    feature,
    shared,
  } = options;
  if (!nestModule) {
    throw new SchematicsException(
      'The property "nestModule" option is required for the CoerceNestController rule',
    );
  }
  return chain([
    CoerceNestServiceProject({
      project,
      feature,
      shared,
    }),
    CoerceNestModule({
      project,
      feature,
      shared,
      name: nestModule,
    }),
    (tree) => {
      if (
        !HasNestController(
          tree,
          {
            project,
            feature,
            shared,
            name,
            nestModule,
          },
        )
      ) {
        console.log(
          `The project ${ buildNestProjectName({
            project,
            feature,
            shared,
          }) } has not the controller '${ name }'. The controller will now be created ...`,
        );
        return externalSchematic('@nx/nest', 'controller', {
          name,
          project: buildNestProjectName({
            project,
            feature,
            shared,
          }),
          unitTestRunner: 'none',
          flat: true,
          directory: nestModule,
          module: nestModule,
        });
      }
      return undefined;
    },
  ]);
}
