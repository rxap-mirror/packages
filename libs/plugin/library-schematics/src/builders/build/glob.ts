import * as glob from 'glob';

export class Glob {

  public sync(pattern: string): string[] {
    return glob.sync(pattern);
  }

}
