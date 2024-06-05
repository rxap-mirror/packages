import { Rule } from '@angular-devkit/schematics';
import { ExecuteSchematic } from '@rxap/schematics-utilities';
import {
  buildNestProjectName,
  HasNestServiceProject,
} from '@rxap/workspace-utilities';

export interface CoerceNestServiceProjectOptions {
  project: string;
  feature?: string | null;
  shared?: boolean;
  backend: { project?: string | null, kind?: any } | undefined;
}

/**
 * @deprecated removed use the AssertNestProject function Rule
 */
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
          return ExecuteSchematic(
            'feature-microservice',
            {
              feature,
            },
          );
        } else {
          return ExecuteSchematic(
            'frontend-microservice',
            {
              frontend: project,
              feature,
            },
          );
        }
      } else {
        return ExecuteSchematic(
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
