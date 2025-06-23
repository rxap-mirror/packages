import { PromiseExecutor } from '@nx/devkit';
import { DeleteEmptyProperties } from '@rxap/utilities';
import { runExecutor as runGenerator } from '../run-generator/executor';
import { DockerComposeExecutorSchema } from './schema';

const runExecutor: PromiseExecutor<DockerComposeExecutorSchema> = async (
  options, context,
) => {
  console.log('Executor ran for DockerCompose', options);
  return runGenerator({
    generator: '@rxap/plugin-workspace:docker-compose',
    options: DeleteEmptyProperties({ ...options }),
    withoutProjectArgument: true,
  }, context);
};

export default runExecutor;
