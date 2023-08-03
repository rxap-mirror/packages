import { exec } from 'child_process';

export function GetCurrentBranch(): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    exec('git rev-parse --is-inside-work-tree', (error, stdout, stderr) => {
      if (error || stdout.trim() !== 'true') {
        reject(new Error('The current directory is not a git repository'));
      } else {
        exec('git symbolic-ref --short -q HEAD', (error, stdout, stderr) => {
          if (error || !stdout) {
            reject(new Error('HEAD is not pointing to a branch'));
          } else {
            resolve(stdout.trim());
          }
        });
      }
    });
  });
}
