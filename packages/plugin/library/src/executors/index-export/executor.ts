import { PromiseExecutor } from '@nx/devkit';
import {
  flushChanges,
  FsTree,
} from 'nx/src/generators/tree';
import { DeleteEmptyProperties } from '@rxap/utilities';
import { indexExportGenerator } from '../../generators/index-export/generator';
import { IndexExportExecutorSchema } from './schema';

/**
 * Runs the index-export generator in-process instead of spawning `nx g ...`
 * as a child process. Spawning costs a full project graph computation per
 * project (~8s) while the generator itself takes only milliseconds.
 */
const runExecutor: PromiseExecutor<IndexExportExecutorSchema> = async (
  options, context
) => {
  console.log('Executor ran for IndexExport', options);

  if (!context.projectName) {
    console.error('No project name found in the context');
    return { success: false };
  }

  const tree = new FsTree(context.root, false);

  await indexExportGenerator(tree, {
    project: context.projectName,
    ...DeleteEmptyProperties({
      generateRootExport: options.generateRootExport,
    }),
  } as any);

  const changes = tree.listChanges();
  flushChanges(context.root, changes);
  for (const change of changes) {
    console.log(`${ change.type } ${ change.path }`);
  }

  return { success: true };
};

export default runExecutor;
