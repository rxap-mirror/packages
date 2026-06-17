import { spawn } from 'child_process';

export function YarnRun(args: string[]) {
  console.log(`$ yarn ${ args.join(' ') }`);
  return new Promise((resolve, reject) => {
    const s = spawn(
      'yarn',
      args,
      {
        stdio: [ 'ignore', 'pipe', 'inherit' ],
        shell: true,
      },
    );
    s.on('error', (err: Error & { code?: string }) => {
      if (err.code === 'ENOENT') {
        console.error('Yarn must be installed to use the CLI.');
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
        reject(new Error(`yarn ${ args.join(' ') } exited with code ${ code }`));
      }
    });
  });
}
