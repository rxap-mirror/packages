import { Tree } from '@nx/devkit';
import { GetWorkspaceName } from '@rxap/workspace-utilities';
import { spawn } from 'child_process';

/**
 * Executes a git command with the provided arguments.
 *
 * @param {Array<string>} args - The arguments for the git command.
 * @return {Promise<string>} - A promise that resolves with the output of the git command.
 *                            The output is a string after trimming any leading or trailing whitespace.
 * @throws {Error} - If an error occurs during execution of the git command.
 */
function git(args: string[]): Promise<string> {
  console.log(`$ git ${ args.join(' ') }`.grey);
  return new Promise((resolve, reject) => {
    const s = spawn(
      'git',
      args,
      {
        stdio: [ 'ignore', 'pipe', 'inherit' ],
        shell: true,
      },
    );
    let dataBuffer = '';
    s.on('error', (err: any) => {
      if (err.code === 'ENOENT') {
        console.log('git must be installed to use the CLI.'.red);
      } else {
        reject(err);
      }
    });
    s.stdout?.on('data', (data) => {
      dataBuffer += data.toString('utf-8').trim();
    });
    s.stdout?.on('end', () => {
      resolve(dataBuffer.trim());
    });
  });
}

export async function determineRepositoryUrl(tree: Tree, options: { repositoryUrl?: string }): Promise<string> {

  let repositoryUrl = options.repositoryUrl;

  if (!repositoryUrl) {

    try {
      repositoryUrl = await git([ 'config', '--get', 'remote.origin.url' ]);
    } catch (e: any) {
      throw new Error('Could not determine repository URL. Please provide one with the --repository-url option.');
    }

  }

  if (repositoryUrl.includes('{workspaceName}')) {
    repositoryUrl = repositoryUrl.replace('{workspaceName}', GetWorkspaceName(tree));
  }

  if (repositoryUrl.startsWith('http')) {
    return repositoryUrl;
  }

  if (repositoryUrl.match(/.+@.+:.+\.git/)) {
    const domain = repositoryUrl.split('@')[1].split(':')[0];
    const path = repositoryUrl.split(':')[1].replace(/\.git$/, '');
    return `https://${domain}/${ path }`;
  }

  return repositoryUrl;

}
