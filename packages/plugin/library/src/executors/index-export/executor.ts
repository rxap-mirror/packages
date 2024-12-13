import { PromiseExecutor } from '@nx/devkit';
import { DeleteEmptyProperties } from '@rxap/utilities';
import { runExecutor as runGenerator } from '../run-generator/executor';
import { IndexExportExecutorSchema } from './schema';

const runExecutor: PromiseExecutor<IndexExportExecutorSchema> = async (
  options, context
) => {
  console.log('Executor ran for IndexExport', options);
  return runGenerator({
    generator: '@rxap/plugin-library:index-export',
    options: DeleteEmptyProperties({
      generateRootExport: options.generateRootExport,
    })
  }, context);
};

export default runExecutor;
