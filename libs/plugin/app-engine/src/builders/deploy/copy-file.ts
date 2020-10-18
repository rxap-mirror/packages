import { copyFileSync } from 'fs';

export class CopyFile {

  public sync(src: string, dest: string): void {
    copyFileSync(src, dest);
  }

}
