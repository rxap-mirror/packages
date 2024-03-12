import { ExecutorContext } from '@nx/devkit';
import { GuessOutputPathFromContext } from '@rxap/plugin-utilities';
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  symlinkSync,
} from 'fs';
import { join } from 'path';
import { NodeModulesLinkingExecutorSchema } from './schema';

function createSymlink(target: string, link: string) {
  try {
    symlinkSync(target, link, 'junction'); // 'junction' for directories on Windows, use 'dir' for POSIX
    console.log(`Symlink created: ${link} -> ${target}`);
  } catch (error) {
    console.error('Error creating symlink:', error);
  }
}

function checkSymlinkExists(linkPath: string) {
  try {
    const stats = lstatSync(linkPath);
    return stats.isSymbolicLink();
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // Link does not exist
      return false;
    }
    throw error; // Rethrow if it's an unexpected error
  }
}

export default async function runExecutor(
  options: NodeModulesLinkingExecutorSchema,
  context: ExecutorContext
) {
  console.log('Executor ran for NodeModulesLinking', options);

  const outputPath = GuessOutputPathFromContext(context);
  const packageJsonPath = join(context.root, outputPath, 'package.json');

  if (!existsSync(packageJsonPath)) {
    console.log('package.json does not exist at', packageJsonPath);
    return { success: false };
  }

  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  const packageName = packageJson.name.replace(/@rxap\//, '');
  const nodeModulesDir = join(context.root, 'dist', 'node_modules', '@rxap');
  mkdirSync(nodeModulesDir, { recursive: true });

  const link = join(nodeModulesDir, packageName);
  const target = join('../../../', outputPath);

  if (!checkSymlinkExists(link)) {
    console.log('Creating symlink:', link, '->', target);
    createSymlink(target, link);
  } else {
    console.log('Symlink already exists:', link);
  }

  return {
    success: true,
  };
}
