import { Tree } from '@angular-devkit/schematics';
import { GuessProjectName } from './guess-project-name';
import { GetProjectSourceRoot } from './get-project';

/**
 * Tries to guess the project source root from the option path and project
 *
 * 1. if the project option is defined consult the project config for the root
 * 2. get all available project roots and check which root bests matches the option path
 *
 * default: throw an error
 *
 * @param host the current Tree
 * @param options a partial option object with path or/and project defined
 */
export function GuessProjectSourceRoot(host: Tree, options: { path?: string, project?: string }): string {

  const projectName = GuessProjectName(host, options);

  return GetProjectSourceRoot(host, projectName);

}
