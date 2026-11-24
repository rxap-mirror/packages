import {
  detectPackageManager,
  getPackageManagerCommand,
} from '@nx/devkit';
import { spawn } from 'child_process';

function spawnCommand(command: string, args: string[]) {
  console.log(`$ ${ command } ${ args.join(' ') }`);
  return new Promise((resolve, reject) => {
    const s = spawn(
      command,
      args,
      {
        stdio: [ 'ignore', 'pipe', 'inherit' ],
        shell: true,
      },
    );
    s.on('error', (err: Error & { code?: string }) => {
      if (err.code === 'ENOENT') {
        console.error(`'${ command.split(' ')[0] }' must be installed to use the CLI.`);
      } else {
        reject(err);
      }
    });
    s.stdout.on('data', (data: Buffer) => {
      console.log(data.toString('utf-8'));
    });
    s.on('close', (code: number | null) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`${ command } ${ args.join(' ') } exited with code ${ code }`));
      }
    });
  });
}

/**
 * Runs a binary of an installed package with the package manager of the workspace, e.g.
 * `PackageManagerExec(['localazy', 'download'])` runs `pnpm exec localazy download`, `npx localazy download` or
 * `yarn localazy download`.
 *
 * @param args the binary name followed by its arguments
 * @param root the workspace root used to detect the package manager (defaults to the current working directory)
 */
export function PackageManagerExec(args: string[], root = process.cwd()) {
  return spawnCommand(getPackageManagerCommand(detectPackageManager(root), root).exec, args);
}

/**
 * @deprecated use `PackageManagerExec`, it uses the package manager of the workspace instead of always yarn
 */
export function YarnRun(args: string[]) {
  return spawnCommand('yarn', args);
}
