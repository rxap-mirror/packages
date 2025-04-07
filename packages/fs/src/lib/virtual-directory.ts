import { FileDoesNotExistError } from './file-does-not-exist.error';
import { FolderDoesNotExistError } from './folder-does-not-exist.error';
import {
  VirtualFile,
  VirtualFileLike,
} from './virtual-file';

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

export class VirtualDirectory implements VirtualDirectoryLike {

  constructor(
    public name: string,
    public readonly fullName: string,
    protected readonly children = new Map<string, VirtualFile | VirtualDirectory>(),
  ) {}

  get childrenNames() {
    return Array.from(this.children.keys());
  }

  static CreateRoot() {
    return new VirtualDirectory('root', '');
  }

  forEachFile(callback: (file: VirtualFile) => void): void {
    for (const child of this.children.values()) {
      if (child instanceof VirtualFile) {
        callback(child);
      } else {
        child.forEachFile(callback);
      }
    }
  }

  addFile(file: VirtualFile, force = false) {
    let path = file.fullName;
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

  public setFile(name: string, file: VirtualFile) {
    this.children.set(name, file);
  }

  public setDirectory(name: string, directory: VirtualDirectory) {
    this.children.set(name, directory);
  }

  public hasFile(name: string) {
    return this.children.has(name) && this.children.get(name) instanceof VirtualFile;
  }

  public hasDirectory(name: string) {
    return this.children.has(name) && this.children.get(name) instanceof VirtualDirectory;
  }

  public file(name: string) {
    const file = this.children.get(name);
    if (file instanceof VirtualFile) {
      return file;
    }
    if (!file) {
      throw new FileDoesNotExistError(name);
    }
    throw new Error(`'${ name }' is not a file`);
  }

  public directory(name: string) {
    const directory = this.children.get(name);
    if (directory instanceof VirtualDirectory) {
      return directory;
    }
    if (!directory) {
      throw new FolderDoesNotExistError(name);
    }
    throw new Error(`'${ name }' is not a directory`);
  }

  public findFile(match: (file: VirtualFile) => boolean, mimetype?: string): VirtualFile;
  public findFile(path: string, mimetype?: string): VirtualFile;
  public findFile(pathOrMatch: string | ((file: VirtualFile) => boolean), mimetype?: string): VirtualFile {
    if (typeof pathOrMatch === 'string') {
      return this._findFileByPath(pathOrMatch, mimetype);
    }
    return this._findFileByMatch(pathOrMatch);
  }

  private _findFileByPath(path: string, mimetype?: string): VirtualFile {
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
          file.setMimeType(mimetype);
        }
        return file;
      }
      directory = directory.directory(fragment);
    }
    throw new Error(`The file '${ path }' does not exist`);
  }

  private _findFileByMatch(match: (file: VirtualFile) => boolean): VirtualFile {
    for (const child of this.flatten()) {
      if (match(child)) {
        return child;
      }
    }
    throw new Error(`Match function does not match any file`);
  }

  public flatten(): VirtualFile[] {
    const files: VirtualFile[] = [];
    for (const child of this.children.values()) {
      if (child instanceof VirtualFile) {
        files.push(child);
      } else {
        files.push(...child.flatten());
      }
    }
    return files;
  }

  toJSON() {
    const json: Record<string, unknown> = {};
    for (const [ name, child ] of this.children.entries()) {
      if (child instanceof VirtualFile) {
        json[name] = null;
      } else {
        json[name] = child.toJSON();
      }
    }
    return json;
  }

  addDirectory(virtualDirectory: VirtualDirectory) {
    this.children.set(virtualDirectory.name, virtualDirectory);
  }
}
