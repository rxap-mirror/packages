import {
  SchematicsException,
  Tree,
} from '@angular-devkit/schematics';
import { GuessProjectRoot } from './guess-project-root';
import { GetWorkspace } from './workspace';

/**
 * Tries to guess the project name.
 *
 * if the option project is defined. The value will be returned.
 * Else the project root is guessed and the first project with this root will be retuned
 *
 * @param host the current Tree
 * @param options a partial option object with path or/and project defined
 */
export function GuessProjectName(host: Tree,
                                 {
                                   path,
                                   project,
                                 }: { path?: string, project?: string },
) {

  if (!path && !project) {
    throw new SchematicsException('The options path and project are not defined. At least one of them must be defined');
  }

  if (project) {
    return project;
  }

  const projectRoot = GuessProjectRoot(host, { path });

  const workspace = GetWorkspace(host);

  for (const [ name, project ] of workspace.projects.entries()) {
    if (project.root === projectRoot) {
      return name;
    }
  }

  throw new SchematicsException('FATAL: this state should never be reached');

}
