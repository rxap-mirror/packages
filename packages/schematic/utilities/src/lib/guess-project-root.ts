import {SchematicsException, Tree} from '@angular-devkit/schematics';
import {GetProjectRoot} from './get-project';
import {GetWorkspace} from './workspace';
import {IsDefined} from './is-defined';

/**
 * Tries to guess the project root from the option path and project
 *
 * 1. if the project option is defined consult the project config for the root
 * 2. get all available project roots and check which root bests matches the option path
 *
 * default: throw an error
 *
 * @param host the current Tree
 * @param options a partial option object with path or/and project defined
 */
export function GuessProjectRoot(host: Tree, {path, project}: { path?: string, project?: string }): string {

  if (!path && !project) {
    throw new SchematicsException('The options path and project are not defined. At least one of them must be defined');
  }

  if (project) {
    return GetProjectRoot(host, project);
  }

  if (!path) {
    throw new SchematicsException('FATAL: this state should never be reached');
  }

  const workspace = GetWorkspace(host);

  const allProjectRoots: string[] = Array.from(workspace.projects.values())
    .map(project => project.root)
    .filter(IsDefined);

  let bestMatch: string | null = null;

  for (const projectRoot of allProjectRoots) {
    if (path.match(new RegExp(projectRoot.replace('/', '\\/')))) {
      if (!bestMatch) {
        bestMatch = projectRoot;
      }
      if (bestMatch.length < projectRoot.length) {
        bestMatch = projectRoot;
      }
    }
  }

  if (!bestMatch) {
    throw new SchematicsException('The project root could not be guessed');
  }

  return bestMatch;

}
