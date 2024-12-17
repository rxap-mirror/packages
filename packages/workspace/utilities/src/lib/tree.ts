import { CoercePrefix } from '@rxap/utilities';
import { Mode, unlinkSync, writeFileSync, readdirSync, readFileSync, renameSync, existsSync, statSync } from 'fs';
import {
  dirname,
  join,
} from 'path';

export type JsonArray = Array<JsonValue>

export interface JsonObject {
  [prop: string]: JsonValue;
}

export type JsonValue = boolean | string | number | JsonArray | JsonObject | null;

/**
 * Determines if a given value is a valid JSON object.
 *
 * This function checks if the provided value is an object, ensuring it is neither `null` nor an array.
 * It is useful for type-guarding purposes, allowing TypeScript to infer the correct type based on the check.
 *
 * @param value The `JsonValue` to be checked.
 * @returns `true` if the value is a non-null object and not an array, otherwise `false`.
 *
 * @example
 * IsJsonObject({ key: "value" }); // returns true
 * IsJsonObject([1, 2, 3]); // returns false
 * IsJsonObject("I am not an object"); // returns false
 * IsJsonObject(null); // returns false
 */
export function IsJsonObject(value: JsonValue): value is JsonObject {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Determines if the provided `JsonValue` is a `JsonArray`.
 *
 * This function checks if the given `value` is both truthy and an array. It utilizes the `Array.isArray` method
 * to ensure that the `value` conforms to the `JsonArray` type, which is an array structure in JSON format.
 *
 * @param value - The `JsonValue` to be checked.
 * @returns `true` if `value` is a non-null array, otherwise `false`.
 *
 * @example
 * IsJsonArray([1, 2, 3]); // returns true
 * IsJsonArray({ key: 'value' }); // returns false
 * IsJsonArray(null); // returns false
 */
export function IsJsonArray(value: JsonValue): value is JsonArray {
  return !!value && Array.isArray(value);
}

export interface TreeLike {
  delete(path: string): void;

  rename(from: string, to: string): void;

  exists(path: string): boolean;

}

/**
 * Checks if the provided object adheres to the `TreeLike` interface.
 *
 * A `TreeLike` object is expected to have the following methods:
 * - `delete`: A function to remove an element from the tree.
 * - `rename`: A function to rename an element in the tree.
 * - `exists`: A function to check the existence of an element in the tree.
 *
 * @param tree - The object to be checked.
 * @returns `true` if the object has all the required `TreeLike` methods, otherwise `false`.
 * @template TreeLike - An interface or type that the `tree` parameter is expected to conform to.
 */
export function IsTreeLike(tree: any): tree is TreeLike {
  return typeof tree.delete === 'function'
    && typeof tree.rename === 'function'
    && typeof tree.exists === 'function';
}

export interface SchematicTreeLike extends TreeLike {
  read(filePath: string): Buffer | null;

  overwrite(path: string, content: Buffer | string): void;

  create(path: string, content: Buffer | string): void;

  readText(path: string): string;

  readJson(path: string): JsonValue;

  root: FakeDirEntry;

  get(path: string): FileEntryLike | null;

  getDir(path: string): DirEntryLike;
}

export interface TreeWriteOptions {
  /**
   * Permission to be granted on the file, given as a string (e.g `755`) or octal integer (e.g `0o755`).
   * The logical OR operator can be used to separate multiple permissions.
   * See https://nodejs.org/api/fs.html#fs_file_modes
   */
  mode?: Mode;
}

export interface FileChange {
  /**
   * Path relative to the workspace root
   */
  path: string;
  /**
   * Type of change: 'CREATE' | 'DELETE' | 'UPDATE'
   */
  type: 'CREATE' | 'DELETE' | 'UPDATE';
  /**
   * The content of the file or null in case of delete.
   */
  content: Buffer | null;
  /**
   * Options to set on the file being created or updated.
   */
  options?: TreeWriteOptions;
}

export interface GeneratorTreeLike extends TreeLike {
  read(filePath: string): Buffer | null;

  read(filePath: string, encoding: BufferEncoding): string | null;

  write(filePath: string, content: Buffer | string, options?: TreeWriteOptions): void;

  isFile(filePath: string): boolean;

  children(dirPath: string): string[];

  listChanges(): FileChange[];

  changePermissions(filePath: string, mode: Mode): void;

  root: string;
}

/**
 * Determines if a given `tree` object conforms to the `SchematicTreeLike` interface.
 *
 * This function checks if the `tree` object has all the necessary methods and properties
 * defined in the `SchematicTreeLike` interface. It verifies the existence and correct type
 * of several methods and properties that are essential for interacting with a schematic tree structure.
 *
 * @param tree - The tree object to check.
 * @returns `true` if the `tree` object matches the `SchematicTreeLike` interface, otherwise `false`.
 */
export function IsSchematicTreeLike(tree: TreeLike): tree is SchematicTreeLike {
  return typeof (tree as SchematicTreeLike).overwrite === 'function'
    && typeof (tree as SchematicTreeLike).create === 'function'
    && typeof (tree as SchematicTreeLike).readText === 'function'
    && typeof (tree as SchematicTreeLike).readJson === 'function'
    && typeof (tree as SchematicTreeLike).root === 'object'
    && typeof (tree as SchematicTreeLike).get === 'function'
    && typeof (tree as SchematicTreeLike).getDir === 'function'
    && typeof (tree as SchematicTreeLike).read === 'function'
    && typeof (tree as SchematicTreeLike).exists === 'function'
    && typeof (tree as SchematicTreeLike).delete === 'function'
    && typeof (tree as SchematicTreeLike).rename === 'function';

}

/**
 * Checks if a given tree-like structure conforms to the `GeneratorTreeLike` interface.
 *
 * This function determines if the provided `tree` object is not a `SchematicTreeLike` and has a `root` property of type string, which are the characteristics of a `GeneratorTreeLike`.
 *
 * @param tree - The tree-like object to check.
 * @returns `true` if the `tree` is a `GeneratorTreeLike`, otherwise `false`.
 *
 * @example
 *
 * const tree = { root: 'rootNode', nodes: [] };
 * console.log(IsGeneratorTreeLike(tree)); // Output: true or false based on the structure of `tree`
 * ```
 */
export function IsGeneratorTreeLike(tree: TreeLike): tree is GeneratorTreeLike {
  return IsTreeLike(tree)
         && typeof (tree as GeneratorTreeLike).root === 'string'
        && typeof (tree as GeneratorTreeLike).read === 'function'
        && typeof (tree as GeneratorTreeLike).write === 'function'
        && typeof (tree as GeneratorTreeLike).children === 'function'
        && typeof (tree as GeneratorTreeLike).isFile === 'function'
        && typeof (tree as GeneratorTreeLike).listChanges === 'function'
        && typeof (tree as GeneratorTreeLike).changePermissions === 'function';
}

export function IsFsTreeLike(tree: TreeLike): tree is FsTree {
  return tree instanceof FsTree;
}

export interface FileEntryLike {
  path: string;
  content: Buffer;
}

export interface DirEntryLike {
  path: string;
  subdirs: string[];
  subfiles: string[];
  parent: DirEntryLike | null;

  dir(name: string): DirEntryLike;

  file(name: string): FileEntryLike | null;

  visit(visitor: any): void;
}

export class FakeDirEntry implements DirEntryLike {

  constructor(
    public readonly path: string,
    private readonly tree: GeneratorTreeLike | FsTree,
  ) {}

  public get parent(): FakeDirEntry | null {
    const parentPath = dirname(this.path);
    if (parentPath === this.path) {
      return null;
    }
    return new FakeDirEntry(parentPath, this.tree);
  }

  public get subdirs(): string[] {
    return this.tree.children(this.path).filter(child => !this.tree.isFile(child));
  }

  public get subfiles(): string[] {
    return this.tree.children(this.path).filter(child => this.tree.isFile(child));
  }

  dir(name: string): FakeDirEntry {
    const dirPath = join(this.path, name);
    return new FakeDirEntry(dirPath, this.tree);
  }

  file(name: string): FileEntryLike | null {
    const filePath = join(this.path, name);
    if (!this.tree.isFile(filePath)) {
      return null;
    }
    const content = this.tree.read(filePath);
    if (content === null) {
      return null;
    }
    return {
      path: filePath as any,
      content,
    };
  }

  visit(visitor: any): void {
    throw new Error('Method not implemented.');
  }

}

export class FsTree implements TreeLike {

  constructor(public readonly root: string) {}

  delete(path: string): void {
    unlinkSync(join(this.root, path));
  }

  rename(from: string, to: string): void {
    renameSync(join(this.root, from), join(this.root, to));
  }

  exists(path: string): boolean {
    return existsSync(join(this.root, path));
  }

  read(path: string, encoding: BufferEncoding): string | null;
  read(path: string): Buffer | null;
  read(path: string, encoding?: BufferEncoding): Buffer | string | null {
    return readFileSync(join(this.root, path), encoding);
  }

  write(filePath: string, content: Buffer | string, options?: TreeWriteOptions): void {
    writeFileSync(join(this.root, filePath), content, options);
  }

  isFile(filePath: string): boolean {
    return statSync(join(this.root, filePath)).isFile();
  }

  children(dirPath: string): string[] {
    return readdirSync(join(this.root, dirPath));
  }
}

export class TreeAdapter implements TreeLike, GeneratorTreeLike, SchematicTreeLike {

  /**
   * @deprecated dont use this property
   */
  get root(): any {
    console.error('Dont use tree.root the behavior is unpredictable!');
    if (IsSchematicTreeLike(this.wrapped)) {
      return this.wrapped.root;
    }
    if (IsGeneratorTreeLike(this.wrapped)) {
      return this.wrapped.root;
    }
    if (IsFsTreeLike(this.wrapped)) {
      return this.wrapped.root;
    }
    throw new Error('Invalid tree');
  }

  constructor(public readonly wrapped: TreeLike) {
    if (!wrapped) {
      throw new Error('FATAL: wrapped tree is not defined');
    }
    if (!IsGeneratorTreeLike(wrapped) && !IsSchematicTreeLike(wrapped) && !IsFsTreeLike(wrapped)) {
      throw new Error('Invalid tree');
    }
  }

  // region generic
  delete(path: string): void {
    this.wrapped.delete(path);
  }

  rename(from: string, to: string): void {
    this.wrapped.rename(from, to);
  }

  exists(path: string): boolean {
    return this.wrapped.exists(path);
  }

  // endregion

  // region overloaded
  read(filePath: string, encoding: BufferEncoding): string | null
  read(filePath: string): Buffer | null;
  read(filePath: string, encoding?: BufferEncoding): string | Buffer | null {
    if (IsGeneratorTreeLike(this.wrapped)) {
      if (encoding) {
        return this.wrapped.read(filePath, encoding);
      } else {
        return this.wrapped.read(filePath);
      }
    }
    if (IsSchematicTreeLike(this.wrapped)) {
      if (encoding) {
        return this.wrapped.read(filePath)?.toString(encoding) ?? null;
      }
      return this.wrapped.read(filePath);
    }
    if (IsFsTreeLike(this.wrapped)) {
      if (encoding) {
        return this.wrapped.read(filePath, encoding);
      }
      return this.wrapped.read(filePath);
    }
    throw new Error('Invalid tree');
  }

  // endregion

  // region generators
  write(filePath: string, content: Buffer | string, options?: TreeWriteOptions): void {
    if (IsGeneratorTreeLike(this.wrapped)) {
      this.wrapped.write(filePath, content, options);
      return;
    }
    if (IsSchematicTreeLike(this.wrapped)) {
      if (options) {
        console.warn('TreeWriteOptions are not supported by schematic tree like instance');
      }
      this.wrapped.overwrite(filePath, content);
      return;
    }
    if (IsFsTreeLike(this.wrapped)) {
      this.wrapped.write(filePath, content);
      return;
    }
    throw new Error('Invalid tree');
  }

  isFile(filePath: string): boolean {
    if (IsGeneratorTreeLike(this.wrapped)) {
      return this.wrapped.isFile(filePath);
    }
    if (IsSchematicTreeLike(this.wrapped)) {
      const testString = `Path "${ CoercePrefix(filePath, '/') }" is a directory.`;
      try {
        this.wrapped.get(filePath);
        return true;
      } catch (e: any) {
        if (e.message === testString) {
          return false;
        }
        console.error(`It is possible that the schematic tree class has a changed error message test with: '${ e.message }' === ${ testString }`);
        throw e;
      }
    }
    if (IsFsTreeLike(this.wrapped)) {
      return this.wrapped.isFile(filePath);
    }
    throw new Error('Invalid tree');
  }

  children(dirPath: string): string[] {
    if (IsGeneratorTreeLike(this.wrapped)) {
      return this.wrapped.children(dirPath);
    }
    if (IsSchematicTreeLike(this.wrapped)) {
      const dir = this.wrapped.getDir(dirPath);
      return [ ...dir.subfiles, ...dir.subdirs ];
    }
    if (IsFsTreeLike(this.wrapped)) {
      return this.wrapped.children(dirPath);
    }
    throw new Error('Invalid tree');
  }

  listChanges(): FileChange[] {
    if (IsGeneratorTreeLike(this.wrapped)) {
      return this.wrapped.listChanges();
    }
    throw new Error('Invalid tree. The method listChanges is not supported by nx tree objects!');
  }

  changePermissions(filePath: string, mode: Mode): void {
    if (IsGeneratorTreeLike(this.wrapped)) {
      this.wrapped.changePermissions(filePath, mode);
      return;
    }
    throw new Error('Invalid tree. The method changePermissions is not supported by nx tree objects!');
  }

  // endregion

  // region schematics
  overwrite(path: string, content: Buffer | string): void {
    if (IsSchematicTreeLike(this.wrapped)) {
      this.wrapped.overwrite(path, content);
      return;
    }
    if (IsGeneratorTreeLike(this.wrapped)) {
      this.wrapped.write(path, content);
      return;
    }
    if (IsFsTreeLike(this.wrapped)) {
      this.wrapped.write(path, content);
      return;
    }
    throw new Error('Invalid tree');
  }

  create(path: string, content: Buffer | string): void {
    if (IsSchematicTreeLike(this.wrapped)) {
      this.wrapped.create(path, content);
      return;
    }
    if (IsGeneratorTreeLike(this.wrapped)) {
      if (this.wrapped.exists(path)) {
        throw new Error(`File ${ path } already exists`);
      }
      this.wrapped.write(path, content);
      return;
    }
    if (IsFsTreeLike(this.wrapped)) {
      if (this.wrapped.exists(path)) {
        throw new Error(`File ${ path } already exists`);
      }
      this.wrapped.write(path, content);
      return;
    }
    throw new Error('Invalid tree');
  }

  readText(path: string): string {
    if (IsSchematicTreeLike(this.wrapped)) {
      return this.wrapped.readText(path);
    }
    if (IsGeneratorTreeLike(this.wrapped)) {
      const content = this.wrapped.read(path, 'utf-8');
      if (content === null) {
        throw new Error(`File ${ path } does not exists`);
      }
      return content;
    }
    if (IsFsTreeLike(this.wrapped)) {
      const content = this.wrapped.read(path, 'utf-8');
      if (content === null) {
        throw new Error(`File ${ path } does not exists`);
      }
      return content;
    }
    throw new Error('Invalid tree');
  }

  readJson<T = JsonValue>(path: string): T {
    if (IsSchematicTreeLike(this.wrapped)) {
      return this.wrapped.readJson(path) as T;
    }
    if (IsGeneratorTreeLike(this.wrapped)) {
      const content = this.wrapped.read(path, 'utf-8');
      if (content === null) {
        throw new Error(`File ${ path } does not exists`);
      }
      return JSON.parse(content);
    }
    if (IsFsTreeLike(this.wrapped)) {
      const content = this.wrapped.read(path, 'utf-8');
      if (content === null) {
        throw new Error(`File ${ path } does not exists`);
      }
      return JSON.parse(content);
    }
    throw new Error('Invalid tree');
  }

  get(path: string): FileEntryLike | null {
    if (IsSchematicTreeLike(this.wrapped)) {
      return this.wrapped.get(path);
    }
    if (IsGeneratorTreeLike(this.wrapped)) {
      const content = this.wrapped.read(path);
      if (content === null) {
        return null;
      }
      return {
        path: path as any,
        content,
      };
    }
    if (IsFsTreeLike(this.wrapped)) {
      const content = this.wrapped.read(path);
      if (content === null) {
        return null;
      }
      return {
        path: path as any,
        content,
      };
    }
    throw new Error('Invalid tree');
  }

  getDir(path: string): DirEntryLike {
    if (IsSchematicTreeLike(this.wrapped)) {
      return this.wrapped.getDir(path);
    }
    if (IsGeneratorTreeLike(this.wrapped)) {
      return new FakeDirEntry(path, this.wrapped);
    }
    if (IsFsTreeLike(this.wrapped)) {
      return new FakeDirEntry(path, this.wrapped);
    }
    throw new Error('Invalid tree');
  }

  // endregion

}
