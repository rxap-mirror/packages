import { logging } from '@angular-devkit/core';
import * as cp from "child_process";
import { ReadFile } from './read-file';
import { join } from 'path';

export class Publish {

  public readFile = new ReadFile();

  constructor(private readonly logger: logging.LoggerApi) {}

  public spawn(command: 'npm' | 'yarn' | 'pnpm', args: string[]) {
    return new Promise((resolve, reject) => {
      const s = cp.spawn(command, args, { stdio: [ 0, 1, 2 ] });
      s.on('error', (err: Error & { code?: string }) => {
        if (err.code === 'ENOENT') {
          this.logger.error(`${command} must be installed to use the CLI.`);
        } else {
          reject(err);
        }
      });
      s.on('close', resolve);
    });
  }

  public publish(outputPath: string, registry?: string) {

    const angularJson = JSON.parse(this.readFile.sync(join(process.cwd(), 'angular.json')));

    let packageManager: any = 'npm';

    if (angularJson.cli && angularJson.cli.packageManager) {
      packageManager = angularJson.cli.packageManager;
    }

    const args = [
      'publish',
      outputPath
    ];

    if (registry) {
      args.push(`--registry ${registry}`);
    }

    args.push('--non-interactive');

    return this.spawn(packageManager, args);
  }

}
