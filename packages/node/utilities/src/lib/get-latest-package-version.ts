import { exec } from 'child_process';

export function GetLatestPackageVersion(packageName: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    exec(`npm view ${ packageName } version`, (err, stdout, stderr) => {
      if (err) {
        reject(stderr);
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

