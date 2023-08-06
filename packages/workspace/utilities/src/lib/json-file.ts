import {
  equals,
  IsFunction,
} from '@rxap/utilities';
import { CoerceFile } from './coerce-file';
import {
  TreeAdapter,
  TreeLike,
} from './tree';

export function HasJsonFile<Tree extends TreeLike>(tree: Tree, filePath: string): boolean {

  const treeAdapter = new TreeAdapter(tree);

  if (treeAdapter.exists(filePath)) {
    const content = treeAdapter.read(filePath)!.toString();

    try {
      JSON.parse(content);
    } catch (e: any) {
      return false;
    }
    return true;
  }
  return false;
}

export function GetJsonFile<T = any>(tree: TreeLike, filePath: string, create = false): T {

  const treeAdapter = new TreeAdapter(tree);

  if (!tree.exists(filePath)) {
    if (!create) {
      throw new Error(`A json file at path '${ filePath }' does not exists`);
    } else {
      treeAdapter.create(filePath, '{}');
    }
  }

  const content = treeAdapter.read(filePath)!.toString();

  try {
    return JSON.parse(content);
  } catch (e: any) {
    throw new Error(`Could not parse the json file '${ filePath }': ${ e.message }`);
  }

}

export interface UpdateJsonFileOptions {
  space?: string | number;
  create?: boolean;
}

export async function UpdateJsonFile<T extends Record<string, any> = Record<string, any>>(
  tree: TreeLike,
  updaterOrJsonFile: T | ((jsonFile: T) => void | PromiseLike<void>),
  filePath: string,
  options?: UpdateJsonFileOptions,
) {
  let jsonFile: T;

  if (IsFunction(updaterOrJsonFile)) {
    jsonFile = GetJsonFile<T>(tree, filePath, options?.create);
    await updaterOrJsonFile(jsonFile);
  } else if (typeof updaterOrJsonFile === 'function') {
    throw new Error('FATAL: the update function was not a function');
  } else {
    jsonFile = updaterOrJsonFile;
  }

  const currentJsonFile = GetJsonFile<T>(tree, filePath, options?.create);

  if (!equals(jsonFile, currentJsonFile)) {
    CoerceFile(tree, filePath, JSON.stringify(jsonFile, undefined, options?.space ?? 2) + '\n');
  }
}
