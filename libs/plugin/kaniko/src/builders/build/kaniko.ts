import * as cp from 'child_process';
import { logging } from '@angular-devkit/core';

export class Kaniko {

  constructor(private readonly logger: logging.LoggerApi) {}

  public spawn(command: string, args: string[]) {
    return new Promise((resolve, reject) => {
      const s = cp.spawn(command, args, { stdio: [ 0, 1, 2 ] });
      s.on('error', (err: Error & { code?: string }) => {
        if (err.code === 'ENOENT') {
          this.logger.error(`Could not find ${command}`);
        } else {
          reject(err);
        }
      });
      s.on('close', resolve);
    });
  }

  public executor(command: string, context: string, dockerfile: string, destinations: string[]) {

    const args = [
      `--context="${context}"`,
      `--dockerfile="${dockerfile}"`
    ];

    for (const destination of destinations) {
      args.push(`--destination=${destination}`);
    }

    return this.spawn(command, args);

  }

}
