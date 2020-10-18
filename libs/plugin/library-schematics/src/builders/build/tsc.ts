import { logging } from '@angular-devkit/core';
import * as cp from 'child_process';

export class Tsc {

  constructor(private readonly logger: logging.LoggerApi) {}

  public spawn(args: string[]) {
    return new Promise((resolve, reject) => {
      const s = cp.spawn('tsc', args, { stdio: [ 0, 1, 2 ] });
      s.on('error', (err: Error & { code?: string }) => {
        if (err.code === 'ENOENT') {
          this.logger.error('Tsc must be installed to use the CLI.  See instructions here: https://www.typescriptlang.org/');
        } else {
          reject(err);
        }
      });
      s.on('close', resolve);
    });
  }

  public compile({ tsConfig }: { tsConfig: string }) {
    const args = [
      `--project`,
      `${tsConfig}`
    ];

    return this.spawn(args);
  }

}
