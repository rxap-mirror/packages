import {
  chain,
  externalSchematic,
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
  const {
    name,
    project,
    feature,
    shared,
  } = options;
  return chain([
    CoerceNestServiceProject({
      project,
      feature,
      shared,
    }),
    (tree) => {
      if (!HasNestModule(
        tree,
        {
          project,
          feature,
          shared,
          name,
        },
      )) {
        console.log(
          `The project '${ buildNestProjectName({
            project,
            feature,
            shared,
          }) }' has not the module '${ name }'. The module will now be created ...`,
        );
        return chain([
          externalSchematic('@nx/nest', 'module', {
            name,
            project: buildNestProjectName({
              project,
              feature,
              shared,
            }),
          }),
          AddNestModuleToAppModule({
            project,
            feature,
            shared,
            name,
          }),
        ]);
      }
      return undefined;
    },
  ]);
}
