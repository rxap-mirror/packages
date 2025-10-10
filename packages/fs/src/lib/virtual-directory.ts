import { FileDoesNotExistError } from './file-does-not-exist.error';
import { FolderDoesNotExistError } from './folder-does-not-exist.error';
import {
  SyncVirtualFileLike,
  VirtualFileLike,
} from './virtual-file';

export interface VirtualDirectoryLike<VF extends VirtualFileLike = VirtualFileLike> {
  findFile(path: string, format?: string): VF;
  forEachFile(callback: (file: VF) => void): void;
  iterateEachFile(): IterableIterator<VF>;
}

export interface FullVirtualDirectoryLike<VF extends VirtualFileLike = VirtualFileLike> extends VirtualDirectoryLike<VF> {
  readonly childrenNames: string[];
  readonly name: string;
  readonly fullName: string;

  directory(name: string): FullVirtualDirectoryLike<VF>;

  file(name: string): VF;

  toJSON(): Record<string, unknown>;

  addFile(file: VirtualFileLike, force?: boolean): VF | Promise<VF>;

  setFile(name: string, file: VirtualFileLike): void | Promise<void>;

  findFile(match: (file: VF) => boolean, mimetype?: string): VF;
  findFile(path: string, mimetype?: string): VF;
  findFile(pathOrMatch: string | ((file: VF) => boolean), mimetype?: string): VF;

  setDirectory(name: string, directory: FullVirtualDirectoryLike<VF>): void;

  hasDirectory(name: string): boolean;

  removeDirectory(name: string): boolean;

  hasFile(match: (file: VF) => boolean): boolean;
  hasFile(path: string): boolean;
  hasFile(pathOrMatch: string | ((file: VF) => boolean)): boolean;

  removeFile(match: (file: VF) => boolean): boolean;
  removeFile(path: string): boolean;
  removeFile(pathOrMatch: string | ((file: VF) => boolean)): boolean;

  clone(name?: string, fullName?: string): FullVirtualDirectoryLike<VF>;

  iterateEachFile(): IterableIterator<VF>;
}

export interface FullSyncVirtualDirectoryLike<VF extends SyncVirtualFileLike> extends FullVirtualDirectoryLike<VF> {
  addFile(file: VirtualFileLike, force?: boolean): VF;
  setFile(name: string, file: VirtualFileLike): void;
}

export interface FullAsyncVirtualDirectoryLike<VF extends VirtualFileLike> extends FullVirtualDirectoryLike<VF> {
  addFile(file: VirtualFileLike, force?: boolean): Promise<VF>;
  setFile(name: string, file: VirtualFileLike): Promise<void>;
}

export function isNotVirtualDirectory<VF extends VirtualFileLike>(value: VirtualDirectory<VF> | VF | undefined): value is VF {
  return !!value && !(value instanceof VirtualDirectory);
}

export function isVirtualDirectory<VF extends VirtualFileLike>(value: VirtualDirectory<VF> | VF | undefined): value is VirtualDirectory<VF> {
  return !!value && value instanceof VirtualDirectory;
}

export class VirtualDirectory<VF extends VirtualFileLike = VirtualFileLike> implements FullVirtualDirectoryLike<VF> {

  constructor(
    public name: string,
    public readonly fullName: string,
    protected readonly children = new Map<string, VF | VirtualDirectory<VF>>(),
  ) {}

  get childrenNames() {
    return Array.from(this.children.keys());
  }

  static CreateRoot<VF extends VirtualFileLike = VirtualFileLike>() {
    return new VirtualDirectory<VF>('root', '');
  }

  forEachFile(callback: (file: VF) => void): void {
    for (const child of this.children.values()) {
      if (isVirtualDirectory(child)) {
        child.forEachFile(callback);
      } else {
        callback(child);
      }
    }
  }

  *iterateEachFile(): IterableIterator<VF> {
    for (const child of this.children.values()) {
      if (isVirtualDirectory(child)) {
        yield* child.iterateEachFile();
      } else {
        yield child;
      }
    }
  }

  addFile(file: VF, force = false) {
    let path = file.fullName ?? file.name;
    path = path.startsWith('/') ? path.substring(1) : path;

    const fragments = path.split('/');
    const fileName = fragments.pop();
    if (!fileName) {
      throw new Error(`The file path '${ path }' is invalid`);
    }
    if (fileName !== file.name) {
      throw new Error(`The file name '${ file.name }' does not match the file name in the path '${ fileName }'`);
    }
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let directory: VirtualDirectory<VF> = this;
    while (fragments.length) {

      const fragment = fragments.shift();
      if (!fragment) {
        throw new Error(`The file path '${ path }' is invalid`);
      }

      if (directory.hasDirectory(fragment)) {
        directory = directory.directory(fragment);
      } else {
        const child = new VirtualDirectory<VF>(fragment, `${ directory.fullName }/${ fragment }`);
        directory.children.set(fragment, child);
        directory = child;
      }

    }
    if (directory.hasFile(file.name) && !force) {
      throw new Error(`The file '${ file.name }' already exists in the directory '${ directory.fullName }'`);
    }
    directory.setFile(file.name, file);
    return file;
  }

  public setFile(name: string, file: VF) {
    this.children.set(name, file);
  }

  public setDirectory(name: string, directory: VirtualDirectory<VF>) {
    this.children.set(name, directory);
  }

  clone(name: string = this.name, fullName: string = this.fullName): VirtualDirectory<VF> {
    if (name !== this.name && !fullName.endsWith(name)) {
      fullName.replace(new RegExp(`${this.name}$`), name);
    }
    return new VirtualDirectory<VF>(name, fullName, new Map(this.children));
  }

  public hasDirectory(name: string) {
    return this.children.has(name) && isVirtualDirectory(this.children.get(name));
  }

  public removeDirectory(name: string) {
    if (this.hasDirectory(name)) {
      this.delete(name);
      return true;
    }
    return false;
  }

  public file(name: string) {
    const file = this.children.get(name);
    if (!file) {
      throw new FileDoesNotExistError(name);
    }
    if (isVirtualDirectory(file)) {
      throw new Error(`'${ name }' is a directory`);
    }
    return file;
  }

  public directory(name: string) {
    const directory = this.children.get(name);
    if (isVirtualDirectory(directory)) {
      return directory;
    }
    if (!directory) {
      throw new FolderDoesNotExistError(name);
    }
    throw new Error(`'${ name }' is not a directory`);
  }

  public findFile(match: (file: VF) => boolean, mimetype?: string): VF;
  public findFile(path: string, mimetype?: string): VF;
  public findFile(pathOrMatch: string | ((file: VF) => boolean), mimetype?: string): VF {
    if (typeof pathOrMatch === 'string') {
      return this.findFileByPath(pathOrMatch, mimetype);
    }
    return this.findFileByMatch(pathOrMatch);
  }

  protected findFileByPath(path: string, mimetype?: string): VF {
    if (path.startsWith('/')) {
      path = path.substring(1);
    }
    const fragments = path.split('/');
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let directory: VirtualDirectory<VF> = this;
    for (let i = 0; i < fragments.length; i++) {
      const fragment = fragments[i];
      if (i === fragments.length - 1) {
        const file = directory.file(fragment);
        if (mimetype) {
          file.setMimeType?.(mimetype);
        }
        return file;
      }
      directory = directory.directory(fragment);
    }
    throw new Error(`The file '${ path }' does not exist`);
  }

  protected findFileByMatch(match: (file: VF) => boolean): VF {
    for (const child of this.flatten()) {
      if (match(child)) {
        return child;
      }
    }
    throw new Error(`Match function does not match any file`);
  }

  public hasFile(match: (file: VF) => boolean): boolean;
  public hasFile(path: string): boolean;
  public hasFile(pathOrMatch: string | ((file: VF) => boolean)): boolean {
    if (typeof pathOrMatch === 'string') {
      return this.hasFileByPath(pathOrMatch);
    }
    return this.hasFileByMatch(pathOrMatch);
  }

  protected hasFileByPath(name: string): boolean {
    return this.children.has(name) && isNotVirtualDirectory(this.children.get(name));
  }

  protected hasFileByMatch(match: (file: VF) => boolean): boolean {
    return Array.from(this.children.values()).filter(file => isNotVirtualDirectory(file)).some(file => match(file));
  }

  public removeFile(match: (file: VF) => boolean): boolean;
  public removeFile(path: string): boolean;
  public removeFile(pathOrMatch: string | ((file: VF) => boolean)): boolean {
    if (typeof pathOrMatch === 'string') {
      return this.hasFileByPath(pathOrMatch);
    }
    return this.hasFileByMatch(pathOrMatch);
  }

  protected removeFileByPath(path: string): boolean {
    if (path.startsWith('/')) {
      path = path.substring(1);
    }
    const fragments = path.split('/');
    if (fragments.length === 0) {
      return false;
    }
    const first = fragments.shift()!;
    if (fragments.length === 0) {
      if (this.hasFile(first)) {
        this.delete(first);
        return true;
      }
    } else {
      if (this.hasDirectory(first)) {
        return this.directory(first).removeFile(fragments.join('/'));
      }
    }
    return false;
  }

  protected removeFileByMatch(match: (file: VF) => boolean): boolean {
    for (const child of this.children.values()) {
      if (isVirtualDirectory(child)) {
        child.removeFile(match);
      } else {
        if (match(child)) {
          this.delete(child.name);
          return true;
        }
      }
    }
    return false;
  }

  protected delete(path: string) {
    this.children.delete(path);
  }

  public flatten(): VF[] {
    const files: VF[] = [];
    for (const child of this.children.values()) {
      if (isVirtualDirectory(child)) {
        files.push(...child.flatten());
      } else {
        files.push(child);
      }
    }
    return files;
  }

  toJSON() {
    const json: Record<string, unknown> = {};
    for (const [ name, child ] of this.children.entries()) {
      if (isVirtualDirectory(child)) {
        json[name] = child.toJSON();
      } else {
        json[name] = null;
      }
    }
    return json;
  }

  addDirectory(virtualDirectory: VirtualDirectory<VF>) {
    this.children.set(virtualDirectory.name, virtualDirectory);
  }
}
