import {
  Rule,
  schematic,
} from '@angular-devkit/schematics';
import {
  buildNestProjectName,
  HasNestServiceProject,
} from './project-utilities';

export interface CoerceNestServiceProjectOptions {
  project: string;
  feature?: string;
  shared?: boolean;
}

export function CoerceNestServiceProject(options: CoerceNestServiceProjectOptions): Rule {
  const {
    project,
    feature,
    shared,
  } = options;
  return tree => {
    if (!HasNestServiceProject(tree, options)) {
      console.log(`The nest service project '${ buildNestProjectName(options) }' does not exists. Project will now be created ...`);
      if (feature) {
        if (shared) {
          return schematic(
            'feature-microservice',
            {
              feature,
            },
          );
        } else {
          return schematic(
            'frontend-microservice',
            {
              frontend: project,
              feature,
            },
          );
        }
      } else {
        return schematic(
          'microservice',
          {
            project,
          },
        );
      }
    }
    return undefined;
  };
}
