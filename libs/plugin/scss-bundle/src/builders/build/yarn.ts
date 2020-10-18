import { logging } from '@angular-devkit/core';
import * as cp from 'child_process';

export class Yarn {

  constructor(private readonly logger: logging.LoggerApi) {}

  public spawn(args: string[]) {
    return new Promise((resolve, reject) => {
      const s = cp.spawn('yarn', args, { stdio: [ 'ignore', 'pipe', 'inherit' ], shell: true });
      s.on('error', (err: Error & { code?: string }) => {
        if (err.code === 'ENOENT') {
          this.logger.error('Yarn must be installed to use the CLI.');
        } else {
          reject(err);
        }
      });
      s.stdout.on(
        'data',
        (data: Buffer) => {
          console.log(data.toString('utf-8'));
        }
      );
      s.on('close', resolve);
    });
  }

}
