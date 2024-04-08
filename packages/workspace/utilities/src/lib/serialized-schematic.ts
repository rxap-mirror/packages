import { isPromise } from '@rxap/utilities';
import {
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
  const treeAdapter = new TreeAdapter(tree);
  DeleteSerializedSchematicFile(tree, path);
  if (Array.isArray(data)) {
    treeAdapter.write(join(path, 'schematics.yaml'), stringify(data));
  } else {
    treeAdapter.write(join(path, 'schematic.yaml'), stringify(data));
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
  console.log('check directory:', path);
  console.log('subfiles:', treeAdapter.children(path));
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
  options?: Record<string, unknown>,
): void {
  const newData = {
    package: packageName,
    name: schematicName,
    options: options ?? {},
  };

  function isEqual(data: Record<string, unknown>) {
    return data['package'] === packageName && data['name'] === schematicName;
  }

  UpdateSerializedSchematicFile(tree, path, (data: SerializedSchematic) => {
    console.log('current data:', data);
    if (Array.isArray(data)) {
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
        return [data, newData];
      }
    }
  }, { coerce: true });
}
