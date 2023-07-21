import {
  Rule,
  SchematicsException,
  Tree,
} from '@angular-devkit/schematics';
import { BuildersJson } from '@rxap/workspace-utilities';
import { join } from 'path';
import {
  GetProjectPackageJson,
  GetProjectRoot,
} from './get-project';
import {
  GetJsonFile,
  UpdateJsonFileOptions,
  UpdateJsonFileRule,
} from './json-file';

export enum BuildersJsonType {
  BUILDERS = 'builders'
}

export function GetProjectBuildersJsonFilePath(
  host: Tree,
  projectName: string,
  type: BuildersJsonType = BuildersJsonType.BUILDERS,
  create?: boolean,
): string {

  const projectPackageJson = GetProjectPackageJson(host, projectName);
  const projectRoot = GetProjectRoot(host, projectName);

  let buildersPath: string | undefined = undefined;

  switch (type) {
    case BuildersJsonType.BUILDERS:
      buildersPath = projectPackageJson['builders'];
      break;

    default:
      throw new SchematicsException(`The builders json type '${ type }' is not supported`);

  }

  if (buildersPath) {
    const buildersJsonPath = join(projectRoot, buildersPath);
    if (host.exists(buildersJsonPath)) {
      return buildersJsonPath;
    } else {
      if (create) {
        host.create(buildersJsonPath, '{}');
        return buildersJsonPath;
      } else {
        throw new SchematicsException(`The builders json path of type '${ type }' for the project '${ projectName }' does not exists`);
      }
    }
  } else {
    throw new SchematicsException(`The project '${ projectName }' does not have a '${ type }' property in the package.json`);
  }

}

export function GetProjectBuildersJson(
  host: Tree,
  projectName: string,
  type: BuildersJsonType = BuildersJsonType.BUILDERS,
  create?: boolean,
): BuildersJson {

  const buildersJsonFilePath = GetProjectBuildersJsonFilePath(host, projectName, type, create);

  return GetJsonFile(host, buildersJsonFilePath);

}

export interface UpdateBuildersJsonOptions extends UpdateJsonFileOptions {
  projectName: string;
  type?: BuildersJsonType;
}

export function UpdateBuildersJson(
  updater: (builders: BuildersJson) => void | PromiseLike<void>,
  options: UpdateBuildersJsonOptions,
): Rule {
  return tree => {

    const buildersJsonFilePath = GetProjectBuildersJsonFilePath(
      tree,
      options.projectName,
      options.type,
      options.create,
    );

    return UpdateJsonFileRule(updater, buildersJsonFilePath, options);

  };
}
