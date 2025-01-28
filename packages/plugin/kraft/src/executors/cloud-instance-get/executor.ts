import { PromiseExecutor } from '@nx/devkit';
import { GetProjectRoot } from '@rxap/plugin-utilities';
import { toArgs } from '../to-args';
import run from 'nx/src/executors/run-commands/run-commands.impl';
import { CloudInstanceGetExecutorSchema } from './schema';

const runExecutor: PromiseExecutor<CloudInstanceGetExecutorSchema> = async (
  options, context
) => {
  console.log('Executor ran for CloudInstanceGet', options);
  return run({
    cwd: GetProjectRoot(context),
    command: 'kraft cloud instance get',
    color: true,
    args: toArgs(options).concat([context.projectName]),
    __unparsed__: [],
  }, context);
};

export default runExecutor;
