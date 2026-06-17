import {
  DeleteProperties,
  DeleteUndefinedProperties,
  isPromise,
} from '@rxap/utilities';
import {
  CoerceFile,
  TreeAdapter,
  TreeLike,
} from '@rxap/workspace-utilities';
import { join } from 'path';
import {
  parse,
  stringify,
} from 'yaml';
import 'colors';

export type SerializedSchematic = Record<string, unknown> | Array<Record<string, unknown>>;

/**
 * Retrieves a serialized schematic from a specified directory within a tree-like structure.
 *
 * This function searches for files within a given path in the tree structure that match
 * schematic-related file patterns (specifically YAML or JSON files prefixed with 'schematics' or 'schematic').
 * It reads the content of the first matching file and returns it as a serialized schematic object.
 * If no matching files are found, the function returns null.
 *
 * @param {TreeLike} tree - The tree-like structure containing the files.
 * @param {string} path - The path within the tree where the search should be performed.
 * @returns {SerializedSchematic | null} - The serialized schematic object if a matching file is found; otherwise, null.
 */
export function GetSerializedSchematicFromFile(
  tree: TreeLike,
  path: string,
): SerializedSchematic | null {

  const treeAdapter = new TreeAdapter(tree);

  for (const file of treeAdapter.children(path)) {
    if (file.endsWith('.yaml') || file.endsWith('.yml') || file.endsWith('.json')) {
      if (file.startsWith('schematics') || file.startsWith('schematic')) {
        const content: string = treeAdapter.read(join(path, file), 'utf-8')!;
        return file.endsWith('.json') ? JSON.parse(content) : parse(content);
      }
    }
  }

  return null;
}

/**
 * Writes a serialized schematic to a file, replacing the existing file if the content has changed.
 * This function first retrieves any existing serialized schematic from the specified path. If the
 * existing content differs from the new data provided, it deletes the old file and writes the new
 * content. If the data is an array, it filters out any empty objects before serialization.
 *
 * @param tree The file system tree abstraction used for file operations.
 * @param path The directory path where the schematic file is located.
 * @param data The serialized schematic data to be written. This can be either a single object or an array of objects.
 * @throws {Error} Throws an error if the file cannot be written to the specified directory.
 */
export function WriteSerializedSchematicFile(
  tree: TreeLike,
  path: string,
  data: SerializedSchematic,
): void {
  const current = GetSerializedSchematicFromFile(tree, path);
  const currentContent = current ? stringify(current) : null;
  let newContent: string;
  if (Array.isArray(data)) {
    newContent = stringify(data.filter(item => Object.keys(item).length > 0));
  } else {
    newContent = stringify(data);
  }
  if (currentContent !== newContent) {
    DeleteSerializedSchematicFile(tree, path);
    CoerceFile(tree, join(path, Array.isArray(data) ? 'schematics.yaml' : 'schematic.yaml'), newContent, true);
  }
  if (!HasSerializedSchematicFile(tree, path)) {
    throw new Error(`Failed to write serialized schematic file in directory '${path}'`);
  }
}

/**
 * Checks if a specified directory within a tree-like structure contains any schematic files in serialized formats.
 *
 * This function searches through the children of a specified path within a tree-like structure for files
 * with specific serialized file extensions (`.yaml`, `.yml`, `.json`). It specifically looks for files
 * that start with 'schematics' or 'schematic'. If any such file is found, the function returns true,
 * indicating the presence of a serialized schematic file.
 *
 * @param {TreeLike} tree - The tree-like structure containing directories and files.
 * @param {string} path - The path within the tree where the search should be conducted.
 * @returns {boolean} - Returns true if at least one serialized schematic file is found, otherwise false.
 */
export function HasSerializedSchematicFile(
  tree: TreeLike,
  path: string,
): boolean {
  const treeAdapter = new TreeAdapter(tree);
  for (const file of treeAdapter.children(path)) {
    if (file.endsWith('.yaml') || file.endsWith('.yml') || file.endsWith('.json')) {
      if (file.startsWith('schematics') || file.startsWith('schematic')) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Deletes specific serialized schematic files from a given directory within a tree-like structure.
 *
 * This function iterates over the children of a specified path within the tree structure, identifying
 * and deleting files that are serialized schematic files (specifically YAML or JSON files) that start
 * with 'schematics' or 'schematic'. The function is designed to work with a tree-like data structure
 * that supports basic file operations through a `TreeAdapter`.
 *
 * @param {TreeLike} tree - The tree-like structure containing the files.
 * @param {string} path - The path within the tree where the files are located.
 *
 * @remarks
 * The function uses a `TreeAdapter` to interface with the tree structure, which must be compatible
 * with the TreeLike interface. This adapter facilitates operations like listing children of a node
 * and deleting nodes. The function specifically targets files with extensions '.yaml', '.yml', or '.json'
 * and file names that begin with 'schematics' or 'schematic'.
 *
 * @example
 * // Assuming `projectTree` is a TreeLike object representing a project's file structure:
 * DeleteSerializedSchematicFile(projectTree, '/path/to/directory');
 */
export function DeleteSerializedSchematicFile(
  tree: TreeLike,
  path: string,
): void {
  const treeAdapter = new TreeAdapter(tree);
  for (const file of treeAdapter.children(path)) {
    if (file.endsWith('.yaml') || file.endsWith('.yml') || file.endsWith('.json')) {
      if (file.startsWith('schematics') || file.startsWith('schematic')) {
        treeAdapter.delete(join(path, file));
      }
    }
  }
}

export interface UpdateSerializedSchematicFileOptions {
  /**
   * true - create the file if it does not exist
   */
  coerce?: boolean;
}

export function UpdateSerializedSchematicFile(
  tree: TreeLike,
  path: string,
  updater: (data: SerializedSchematic) => SerializedSchematic,
  options?: UpdateSerializedSchematicFileOptions,
): void
export function UpdateSerializedSchematicFile(
  tree: TreeLike,
  path: string,
  updater: (data: SerializedSchematic) => Promise<SerializedSchematic>,
  options?: UpdateSerializedSchematicFileOptions,
): Promise<void>
/**
 * Updates or creates a serialized schematic file at a specified path within a given tree structure.
 * This function allows modifications to be applied to an existing serialized schematic file using a provided updater function.
 * If the file does not exist and the `coerce` option is set to true, a new file will be created.
 *
 * @param tree - The tree-like structure containing the files and directories.
 * @param path - The path to the serialized schematic file within the tree.
 * @param updater - A function that takes the current serialized schematic data and returns the updated data.
 * This function can return either the updated data directly or a promise that resolves to the updated data.
 * @param options - Optional. Configuration options for updating the serialized schematic file. Defaults to an empty object.
 * Available options include:
 * - `coerce`: A boolean that, when true, allows the creation of a new serialized schematic file if it does not exist.
 *
 * @returns A promise that resolves when the update is complete if the updater function returns a promise.
 * Otherwise, it returns void after synchronously updating the file.
 *
 * @throws {Error} Throws an error if the serialized schematic file does not exist at the specified path and the `coerce` option is false.
 *
 * @example
 *
 * UpdateSerializedSchematicFile(tree, '/path/to/file', data => ({ ...data, newProp: 123 }), { coerce: true });
 * ```
 */
export function UpdateSerializedSchematicFile(
  tree: TreeLike,
  path: string,
  updater: (data: SerializedSchematic) => SerializedSchematic | Promise<SerializedSchematic>,
  options: UpdateSerializedSchematicFileOptions = {},
): void | Promise<void> {
  const hasSerializedSchematicFile = HasSerializedSchematicFile(tree, path);
  if (!hasSerializedSchematicFile) {
    if (options.coerce) {
      console.log(`create new serialized schematic file in directory '${path}'`.blue);
      WriteSerializedSchematicFile(tree, path, {});
    } else {
      throw new Error(`A serialized schematic file does not exist in the directory: ${ path }`);
    }
  }
  const data = GetSerializedSchematicFromFile(tree, path)!;
  const response = updater(data);
  if (isPromise(response)) {
    return response.then(updatedData => WriteSerializedSchematicFile(tree, path, updatedData));
  }
  WriteSerializedSchematicFile(tree, path, response);
}


/**
 * Generates and updates a serialized schematic file with new schematic data.
 *
 * This function is designed to serialize and store schematic configuration data into a specified file within a given tree-like structure. It first cleans and prepares the schematic options by removing specific properties and undefined values. Then, it updates the existing serialized file with the new schematic data or appends it if not already present.
 *
 * @param {TreeLike} tree - The tree-like structure where the file is located.
 * @param {string} path - The file path within the tree where the schematic data should be serialized.
 * @param {string} packageName - The name of the package to which the schematic belongs.
 * @param {string} schematicName - The name of the schematic.
 * @param {Record<string, unknown> | any} [options={}] - Optional parameters for the schematic, provided as a key-value map.
 *
 * The function performs the following operations:
 * 1. Removes specified properties from the options object that are not necessary for serialization.
 * 2. Cleans up nested objects within the options to ensure they do not contain undefined values or empty objects.
 * 3. Checks if the schematic data already exists in the file:
 * - If it exists and is the only entry, it replaces it with the new data.
 * - If it exists among multiple entries, it updates the specific entry.
 * - If it does not exist, it adds the new data to the existing array or creates a new array if the file was empty.
 * 4. Utilizes a coercion strategy when updating the file to ensure data integrity.
 *
 * Note: This function relies on external functions `DeleteUndefinedProperties`, `DeleteProperties`, and `UpdateSerializedSchematicFile` to manipulate and store data.
 */
export function GenerateSerializedSchematicFile(
  tree: TreeLike,
  path: string,
  packageName: string,
  schematicName: string,
  options: Record<string, unknown> | any = {},
): void {
  const newData = {
    package: packageName,
    name: schematicName,
    options: DeleteUndefinedProperties(DeleteProperties(options, [
      'project',
      'projects',
      'overwrite',
      'skipProjects',
      'coerce',
      'replace',
      'feature',
      'skipFormat',
      'cleanup',
    ])),
  };

  for (const key of Object.keys(newData.options)) {
    if (newData.options[key] && typeof newData.options[key] === 'object' && !Array.isArray(newData.options[key])) {
      newData.options[key] = DeleteUndefinedProperties(newData.options[key]);
      if (Object.keys(newData.options[key]).length === 0) {
        delete newData.options[key];
      }
    }
  }

  function isEqual(data: Record<string, unknown>) {
    return data['package'] === packageName && data['name'] === schematicName;
  }

  UpdateSerializedSchematicFile(tree, path, (data: SerializedSchematic) => {
    if (Array.isArray(data)) {
      if (data.length === 1 && data[0] && Object.keys(data[0]).length === 0) {
        return newData;
      }
      const index = data.findIndex(isEqual);
      if (index !== -1) {
        data[index] = newData;
        return data;
      } else {
        return [...data, newData];
      }
    } else {
      if (isEqual(data)) {
        return newData;
      } else {
        if (Object.keys(data).length === 0) {
          return newData;
        }
        return [data, newData];
      }
    }
  }, { coerce: true });
}
