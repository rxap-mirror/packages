import {
  chain,
  externalSchematic,
  noop,
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
  module?: string;
  nestModule?: string;
}

export function CoerceNestController(options: CoerceNestControllerOptions): Rule {
  let {name, module, nestModule} = options;
  nestModule ??= module;
  if (!nestModule) {
    throw new SchematicsException('The property "nestModule" option is required for the CoerceNestController rule');
  }
  return chain([
    CoerceNestServiceProject(options),
    CoerceNestModule({
      ...options,
      name: nestModule,
    }),
    tree => {
      if (!HasNestController(tree, options)) {
        console.log(`The project ${buildNestProjectName(options)} has not the controller '${name}'. The controller will now be created ...`);
        return externalSchematic(
          '@nrwl/nest',
          'controller',
          {
            name,
            project: buildNestProjectName(options),
            unitTestRunner: 'none',
            flat: true,
            directory: module,
            module,
          },
        );
      }
      return noop();
    },
  ]);
}
