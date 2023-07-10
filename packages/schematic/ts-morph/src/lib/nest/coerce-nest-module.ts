import {
  chain,
  externalSchematic,
  noop,
  Rule,
} from '@angular-devkit/schematics';
import { CoerceNestServiceProject } from './coerce-nest-service-project';
import { HasNestModule } from './has-nest-module';
import { AddNestModuleToAppModule } from './add-nest-module-to-app-module';
import { buildNestProjectName } from './project-utilities';

export interface CoerceNestModuleOptions {
  project: string;
  feature?: string;
  shared?: boolean;
  name: string;
}

export function CoerceNestModule(options: CoerceNestModuleOptions): Rule {
  const { name } = options;
  return chain([
    CoerceNestServiceProject(options),
    tree => {
      if (!HasNestModule(tree, options)) {
        console.log(`The project '${ buildNestProjectName(options) }' has not the module '${ name }'. The module will now be created ...`);
        return chain([
          externalSchematic(
            '@nrwl/nest',
            'module',
            {
              name,
              project: buildNestProjectName(options),
            },
          ),
          AddNestModuleToAppModule(options),
        ]);
      }
      return noop();
    },
  ]);
}
