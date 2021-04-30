import { Tree } from '@angular-devkit/schematics';
import { Angular, GetAngularJson } from '@rxap/schematics-utilities';

export function GetProjectPrefix(host: Tree, projectName: string): string {

  const angularJson = new Angular(GetAngularJson(host));
  const prefix      = angularJson.projects.get(projectName)?.prefix ?? angularJson.defaultProject?.prefix

  if (!prefix) {
    throw new Error(`Could not find prefix for project '${projectName}'!`);
  }

  return prefix;

}
