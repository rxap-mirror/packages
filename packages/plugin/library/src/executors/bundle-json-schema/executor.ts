import { PromiseExecutor } from '@nx/devkit';
import { DeleteEmptyProperties } from '@rxap/utilities';
import { runExecutor as runGenerator } from '../run-generator/executor';
import { BundleJsonSchemaExecutorSchema } from './schema';

const runExecutor: PromiseExecutor<BundleJsonSchemaExecutorSchema> = async (
  options, context
) => {
  console.log('Executor ran for IndexJsonSchema', options);
  return runGenerator({
    generator: '@rxap/plugin-library:bundle-json-schema',
    options: DeleteEmptyProperties({})
  }, context);
};

export default runExecutor;
