import { PromiseExecutor } from '@nx/devkit';
import { DeleteEmptyProperties } from '@rxap/utilities';
import {
  RunGenerator,
} from '@rxap/plugin-library';
import { GenerateExecutorSchema } from './schema';

const runExecutor: PromiseExecutor<GenerateExecutorSchema> = async (
  options, context
) => {
  console.log('Executor ran for Generate', options);
  return RunGenerator({
    generator: '@rxap/plugin-open-api:generate',
    options: DeleteEmptyProperties({
      ...options,
    })
  }, context);
};

export default runExecutor;
