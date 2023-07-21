import { Rule } from '@angular-devkit/schematics';
import { ApplyTsMorphProject } from '@rxap/workspace-ts-morph';
import { Project } from 'ts-morph';

export function ApplyTsMorphProjectRule(
  project: Project,
  basePath = '',
  organizeImports = true,
  fixMissingImports = false,
): Rule {
  return tree => ApplyTsMorphProject(tree, project, basePath, organizeImports, fixMissingImports);
}
