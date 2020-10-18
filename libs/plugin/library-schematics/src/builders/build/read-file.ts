import { readFileSync } from 'fs';

export class ReadFile {

  public sync(path: string, options: { encoding: string; flag?: string; } | string = 'utf-8'): string {
    return readFileSync(path, options);
  }

}
