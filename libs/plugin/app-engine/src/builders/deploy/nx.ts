import { logging } from '@angular-devkit/core';
import * as cp from 'child_process';

export class Nx {

  constructor(private readonly logger: logging.LoggerApi) {}

  public spawn(args: string[]) {
    return new Promise((resolve, reject) => {
      const s = cp.spawn('nx', args, { stdio: [ 0, 1, 2 ] });
      s.on('error', (err: Error & { code?: string }) => {
        if (err.code === 'ENOENT') {
          this.logger.error('Nx must be installed to use the CLI.  See instructions here: https://nx.dev/angular');
        } else {
          reject(err);
        }
      });
      s.on('close', resolve);
    });
  }

  public build({ project, configuration }: { project: string, configuration?: string }) {
    const args = [
      'run',
      `${project}:build`
    ];

    if (configuration) {
      args.push(`--configuration=${configuration}`);
    }

    return this.spawn(args);
  }

}
