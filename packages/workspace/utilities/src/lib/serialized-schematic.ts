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
    if (newData.options[key] && typeof newData.options[key] === 'object') {
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
      if (data.length === 1 && Object.keys(data[0]).length === 0) {
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
