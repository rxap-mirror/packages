import { FileDoesNotExistError } from './file-does-not-exist.error';
import { FolderDoesNotExistError } from './folder-does-not-exist.error';
import { VirtualFileLike } from './virtual-file';

export interface VirtualDirectoryLike {
  findFile(path: string, format?: string): VirtualFileLike;
  forEachFile(callback: (file: VirtualFileLike) => void): void;
}

export interface FullVirtualDirectoryLike extends VirtualDirectoryLike {
  readonly childrenNames: string[];
  readonly name: string;
  readonly fullName: string;

  directory(name: string): FullVirtualDirectoryLike;

  file(name: string): VirtualFileLike;

  toJSON(): Record<string, unknown>;

}

export function isNotVirtualDirectory(value: VirtualDirectory | VirtualFileLike | undefined): value is VirtualFileLike {
  return !!value && !(value instanceof VirtualDirectory);
}

export function isVirtualDirectory(value: VirtualDirectory | VirtualFileLike | undefined): value is VirtualDirectory {
  return !!value && value instanceof VirtualDirectory;
}

export class VirtualDirectory implements VirtualDirectoryLike {

  constructor(
    public name: string,
    public readonly fullName: string,
    protected readonly children = new Map<string, VirtualFileLike | VirtualDirectory>(),
  ) {}

  get childrenNames() {
    return Array.from(this.children.keys());
  }

  static CreateRoot() {
    return new VirtualDirectory('root', '');
  }

  forEachFile(callback: (file: VirtualFileLike) => void): void {
    for (const child of this.children.values()) {
      if (isVirtualDirectory(child)) {
        child.forEachFile(callback);
      } else {
        callback(child);
      }
    }
  }

  addFile(file: VirtualFileLike, force = false) {
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
    let directory: VirtualDirectory = this;
    while (fragments.length) {

      const fragment = fragments.shift();
      if (!fragment) {
        throw new Error(`The file path '${ path }' is invalid`);
      }

      if (directory.hasDirectory(fragment)) {
        directory = directory.directory(fragment);
      } else {
        const child = new VirtualDirectory(fragment, `${ directory.fullName }/${ fragment }`);
        directory.children.set(fragment, child);
        directory = child;
      }

    }
    if (directory.hasFile(file.name) && !force) {
      throw new Error(`The file '${ file.name }' already exists in the directory '${ directory.fullName }'`);
    }
    directory.setFile(file.name, file);
  }

  public setFile(name: string, file: VirtualFileLike) {
    this.children.set(name, file);
  }

  public setDirectory(name: string, directory: VirtualDirectory) {
    this.children.set(name, directory);
  }

  public hasDirectory(name: string) {
    return this.children.has(name) && isVirtualDirectory(this.children.get(name));
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

  public findFile(match: (file: VirtualFileLike) => boolean, mimetype?: string): VirtualFileLike;
  public findFile(path: string, mimetype?: string): VirtualFileLike;
  public findFile(pathOrMatch: string | ((file: VirtualFileLike) => boolean), mimetype?: string): VirtualFileLike {
    if (typeof pathOrMatch === 'string') {
      return this.findFileByPath(pathOrMatch, mimetype);
    }
    return this.findFileByMatch(pathOrMatch);
  }

  protected findFileByPath(path: string, mimetype?: string): VirtualFileLike {
    if (path.startsWith('/')) {
      path = path.substring(1);
    }
    const fragments = path.split('/');
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let directory: VirtualDirectory = this;
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

  protected findFileByMatch(match: (file: VirtualFileLike) => boolean): VirtualFileLike {
    for (const child of this.flatten()) {
      if (match(child)) {
        return child;
      }
    }
    throw new Error(`Match function does not match any file`);
  }

  public hasFile(match: (file: VirtualFileLike) => boolean): boolean;
  public hasFile(path: string): boolean;
  public hasFile(pathOrMatch: string | ((file: VirtualFileLike) => boolean)): boolean {
    if (typeof pathOrMatch === 'string') {
      return this.hasFileByPath(pathOrMatch);
    }
    return this.hasFileByMatch(pathOrMatch);
  }

  protected hasFileByPath(name: string): boolean {
    return this.children.has(name) && isNotVirtualDirectory(this.children.get(name));
  }

  protected hasFileByMatch(match: (file: VirtualFileLike) => boolean): boolean {
    return Array.from(this.children.values()).filter(file => isNotVirtualDirectory(file)).some(file => match(file));
  }

  public flatten(): VirtualFileLike[] {
    const files: VirtualFileLike[] = [];
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

  addDirectory(virtualDirectory: VirtualDirectory) {
    this.children.set(virtualDirectory.name, virtualDirectory);
  }
}
