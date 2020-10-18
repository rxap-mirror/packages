import * as cp from 'child_process';
import { join } from 'path';
import { logging } from '@angular-devkit/core';

export interface GCloudDeployOptions {
  project?: string;
  promote?: boolean;
  noPromote?: boolean;
  stopPreviousVersion?: boolean;
  version?: string;
  cwd: string;
}

export class GCloud {

  constructor(private readonly logger: logging.LoggerApi) {}

  public spawn(args: string[], cwd: string) {
    return new Promise((resolve, reject) => {
      const s = cp.spawn('gcloud', args, { stdio: [ 0, 1, 2 ], cwd });
      s.on('error', (err: Error & { code?: string }) => {
        if (err.code === 'ENOENT') {
          this.logger.error('GCloud must be installed to use the CLI.  See instructions here: https://cloud.google.com/sdk/docs');
        } else {
          reject(err);
        }
      });
      s.on('close', resolve);
    });
  }


  public deploy({ project, cwd, noPromote, promote, stopPreviousVersion, version }: GCloudDeployOptions) {
    const args = [
      'app',
      'deploy',
      'app.yaml'
    ];

    if (project) {
      args.push(`--project=${project}`);
    }

    if (noPromote) {
      args.push('--no-promote');
    } else if (promote) {
      args.push('--promote');
    }

    if (stopPreviousVersion) {
      args.push('--stop-previous-version');
    }

    if (version) {
      args.push('--version');
    }

    args.push('--quiet');

    return this.spawn(args, join(process.cwd(), cwd));
  }

}
