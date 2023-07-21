import {
  Rule,
  SchematicsException,
  Tree,
} from '@angular-devkit/schematics';
import { CollectionJson } from '@rxap/workspace-utilities';
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

export enum CollectionJsonType {
  SCHEMATICS = 'schematics',
  MIGRATIONS = 'migrations'
}

export function HasProjectCollectionJsonFile(
  host: Tree,
  projectName: string,
  type: CollectionJsonType = CollectionJsonType.SCHEMATICS,
): boolean {

  const projectPackageJson = GetProjectPackageJson(host, projectName);
  const projectRoot = GetProjectRoot(host, projectName);

  let collectionPath: string | undefined = undefined;

  switch (type) {
    case CollectionJsonType.SCHEMATICS:
      collectionPath = projectPackageJson['schematics'];
      break;
    case CollectionJsonType.MIGRATIONS:
      collectionPath = projectPackageJson['ng-update']?.migrations;
      break;

    default:
      throw new SchematicsException(`The collection json type '${ type }' is not supported`);

  }

  return !!collectionPath && host.exists(join(projectRoot, collectionPath));

}

export function GetProjectCollectionJsonFilePath(
  host: Tree,
  projectName: string,
  type: CollectionJsonType = CollectionJsonType.SCHEMATICS,
  create?: boolean,
): string {

  const projectPackageJson = GetProjectPackageJson(host, projectName);
  const projectRoot = GetProjectRoot(host, projectName);

  let collectionPath: string | undefined = undefined;

  switch (type) {
    case CollectionJsonType.SCHEMATICS:
      collectionPath = projectPackageJson['schematics'];
      break;
    case CollectionJsonType.MIGRATIONS:
      collectionPath = projectPackageJson['ng-update']?.migrations;
      break;

    default:
      throw new SchematicsException(`The collection json type '${ type }' is not supported`);

  }

  if (collectionPath) {
    const collectionJsonPath = join(projectRoot, collectionPath);
    if (host.exists(collectionJsonPath)) {
      return collectionJsonPath;
    } else {
      if (create) {
        host.create(collectionJsonPath, '{}');
        return collectionJsonPath;
      } else {
        throw new SchematicsException(`The collection json path of type '${ type }' for the project '${ projectName }' does not exists`);
      }
    }
  } else {
    throw new SchematicsException(`The project '${ projectName }' does not have a '${ type }' property in the package.json`);
  }

}

export function GetProjectCollectionJson(
  host: Tree,
  projectName: string,
  type: CollectionJsonType = CollectionJsonType.SCHEMATICS,
  create?: boolean,
): CollectionJson {

  const collectionJsonFilePath = GetProjectCollectionJsonFilePath(host, projectName, type, create);

  return GetJsonFile(host, collectionJsonFilePath);

}

export interface UpdateCollectionJsonOptions extends UpdateJsonFileOptions {
  projectName: string;
  type?: CollectionJsonType;
}

export function UpdateCollectionJson(
  updater: (collection: CollectionJson) => void | PromiseLike<void>,
  options: UpdateCollectionJsonOptions,
): Rule {
  return tree => {

    const collectionJsonFilePath = GetProjectCollectionJsonFilePath(
      tree,
      options.projectName,
      options.type,
      options.create,
    );

    return UpdateJsonFileRule(updater, collectionJsonFilePath, options);

  };
}
