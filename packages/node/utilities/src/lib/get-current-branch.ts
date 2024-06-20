import { exec } from 'child_process';

/**
 * Asynchronously retrieves the current branch name of the git repository in the current directory.
 *
 * This function checks if the current directory is a git repository and then fetches the name of the branch
 * that HEAD is pointing to. It uses the `git rev-parse --is-inside-work-tree` command to verify if the directory
 * is within a git repository and `git symbolic-ref --short -q HEAD` to obtain the current branch name.
 *
 * @returns A Promise that resolves to a string representing the current branch name.
 *
 * @throws {Error} Throws an error if the current directory is not a git repository or if HEAD is not pointing to any branch.
 *
 * @example
 * GetCurrentBranch().then(branchName => {
 * console.log(branchName); // Outputs the current branch name
 * }).catch(error => {
 * console.error(error); // Handles any errors
 * });
 */
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
