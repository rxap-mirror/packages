import { Tree } from '@nx/devkit';
import { CoerceFilesStructure } from '@rxap/workspace-utilities';
import { join } from 'path';
import { InitGeneratorSchema } from './schema';

export async function initWorkspace(tree: Tree, options: InitGeneratorSchema) {
  console.log('init gitlab ci workspace');

  CoerceFilesStructure(tree, {
    srcFolder: join(__dirname, 'files', 'basic'),
    target: '',
    overwrite: options.overwrite,
  });

  if (options.onlyPackages) {
    CoerceFilesStructure(tree, {
      srcFolder: join(__dirname, 'files', 'packages'),
      target: '',
      overwrite: options.overwrite,
    });
  } else {
    CoerceFilesStructure(tree, {
      srcFolder: join(__dirname, 'files', 'application'),
      target: '',
      overwrite: options.overwrite,
    });
  }

  if (options.dte) {
    CoerceFilesStructure(tree, {
      srcFolder: join(__dirname, 'files', 'dte'),
      target: '',
      overwrite: options.overwrite,
    });
  } else {
    CoerceFilesStructure(tree, {
      srcFolder: join(__dirname, 'files', 'simple'),
      target: '',
      overwrite: options.overwrite,
    });
  }

}
