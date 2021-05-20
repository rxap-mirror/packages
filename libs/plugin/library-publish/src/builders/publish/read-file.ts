import { readFileSync } from 'fs';

export class ReadFile {

  public sync(path: string, options: { encoding: BufferEncoding; flag?: string; } | BufferEncoding = 'utf-8'): string {
    return readFileSync(path, options);
  }

}
