import { Mode } from 'fs';
import {
  dirname,
  join,
} from 'path';

export type JsonArray = Array<JsonValue>

export interface JsonObject {
  [prop: string]: JsonValue;
}

export type JsonValue = boolean | string | number | JsonArray | JsonObject | null;

export function IsJsonObject(value: JsonValue): value is JsonObject {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export function IsJsonArray(value: JsonValue): value is JsonArray {
  return !!value && Array.isArray(value);
}

export interface TreeLike {
  delete(path: string): void;

  rename(from: string, to: string): void;

  exists(path: string): boolean;

}

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

export interface GeneratorTreeLike extends TreeLike {
  read(filePath: string): Buffer | null;

  read(filePath: string, encoding: BufferEncoding): string | null;

  write(filePath: string, content: Buffer | string, options?: TreeWriteOptions): void;

  isFile(filePath: string): boolean;

  children(dirPath: string): string[];

  root: string;
}

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

export function IsGeneratorTreeLike(tree: TreeLike): tree is GeneratorTreeLike {
  return typeof (tree as GeneratorTreeLike).root === 'string';
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
    private readonly tree: GeneratorTreeLike,
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
    throw new Error('Invalid tree');
  }

  constructor(public readonly wrapped: TreeLike) {}

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
    throw new Error('Invalid tree');
  }

  isFile(filePath: string): boolean {
    if (IsGeneratorTreeLike(this.wrapped)) {
      return this.wrapped.isFile(filePath);
    }
    if (IsSchematicTreeLike(this.wrapped)) {
      const testString = `Path "/${ filePath }" is a directory.`;
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
    throw new Error('Invalid tree');
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
    throw new Error('Invalid tree');
  }

  readJson(path: string): JsonValue {
    if (IsSchematicTreeLike(this.wrapped)) {
      return this.wrapped.readJson(path);
    }
    if (IsGeneratorTreeLike(this.wrapped)) {
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
    throw new Error('Invalid tree');
  }

  getDir(path: string): DirEntryLike {
    if (IsSchematicTreeLike(this.wrapped)) {
      return this.wrapped.getDir(path);
    }
    if (IsGeneratorTreeLike(this.wrapped)) {
      return new FakeDirEntry(path, this.wrapped);
    }
    throw new Error('Invalid tree');
  }

  // endregion

}
