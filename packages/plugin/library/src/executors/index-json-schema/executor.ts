import { PromiseExecutor } from '@nx/devkit';
import { DeleteEmptyProperties } from '@rxap/utilities';
import { runExecutor as runGenerator } from '../run-generator/executor';
import { IndexJsonSchemaExecutorSchema } from './schema';

const runExecutor: PromiseExecutor<IndexJsonSchemaExecutorSchema> = async (
  options, context
) => {
  console.log('Executor ran for IndexJsonSchema', options);
  return runGenerator({
    generator: '@rxap/plugin-library:index-json-schema',
    options: DeleteEmptyProperties({})
  }, context);
};

export default runExecutor;
