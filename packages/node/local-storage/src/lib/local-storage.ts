import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmdirSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'fs';
import { join } from 'path';

export class LocalStorage implements Storage {

  private readonly cache: Map<string, string> = new Map<string, string>();

  constructor(private readonly storageFolder: string) {
    // if the storage folder does not exists create it
    if (!existsSync(storageFolder)) {
      mkdirSync(storageFolder, { recursive: true });
    }
    // if the storage folder is not a directory throw an error
    if (!statSync(storageFolder).isDirectory()) {
      throw new Error(`The storage folder '${ storageFolder }' is not a directory`);
    }
    this.populateCache();
  }

  get length(): number {
    return this.cache.size;
  }

  clear(): void {
    this.cache.clear();
    this.removeDirSync(this.storageFolder);
    mkdirSync(this.storageFolder, { recursive: true });
  }

  getItem(key: string): string | null {
    if (!this.cache.has(key)) {
      if (!existsSync(join(this.storageFolder, key))) {
        return null;
      }
      this.cache.set(key, readFileSync(join(this.storageFolder, key), 'utf-8'));
    }
    return this.cache.get(key)!;
  }

  key(index: number): string | null {
    return Array.from(this.cache.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.cache.delete(key);
    if (existsSync(join(this.storageFolder, key))) {
      unlinkSync(join(this.storageFolder, key));
    }
  }

  setItem(key: string, value: string): void {
    this.cache.set(key, value);
    writeFileSync(join(this.storageFolder, key), value, 'utf-8');
  }

  private populateCache() {
    for (const file of readdirSync(this.storageFolder)) {
      if (statSync(join(this.storageFolder, file)).isFile()) {
        this.cache.set(file, readFileSync(join(this.storageFolder, file), 'utf-8'));
      }
    }
  }

  private removeDirSync(dirPath: string) {
    const files = readdirSync(dirPath);

    for (const file of files) {
      const filePath = join(dirPath, file);
      const stat = statSync(filePath);

      if (stat.isDirectory()) {
        this.removeDirSync(filePath);
      } else {
        unlinkSync(filePath);
      }
    }

    rmdirSync(dirPath);
  }

}
