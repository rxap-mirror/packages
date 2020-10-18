import {
  copyFileSync,
  existsSync,
  statSync,
  mkdirSync,
  readdirSync
} from 'fs';
import { join, dirname } from 'path';

export class CopyFiles {

  public sync(src: string, dest: string): void {
    this.copyRecursiveSync(src, dest);
  }

  private copyRecursiveSync(src: string, dest: string): void {
    const exists      = existsSync(src);
    const stats       = exists && statSync(src);
    const isDirectory = exists && stats && stats.isDirectory();
    if (isDirectory) {
      if (!existsSync(dest)) {
        mkdirSync(dest, { recursive: true });
      }
      readdirSync(src).forEach((childItemName) => this.copyRecursiveSync(
        join(src, childItemName),
        join(dest, childItemName)
      ));
    } else {
      if (!existsSync(dirname(dest))) {
        mkdirSync(dirname(dest), { recursive: true });
      }
      copyFileSync(src, dest);
    }
  }

}
