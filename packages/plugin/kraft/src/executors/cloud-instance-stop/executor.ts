import { PromiseExecutor } from '@nx/devkit';
import { GetProjectRoot } from '@rxap/plugin-utilities';
import { toArgs } from '../to-args';
import run from 'nx/src/executors/run-commands/run-commands.impl';
import { CloudInstanceStopExecutorSchema } from './schema';

const runExecutor: PromiseExecutor<CloudInstanceStopExecutorSchema> = async (
  options, context
) => {
  console.log('Executor ran for CloudInstanceStop', options);
  return run({
    cwd: GetProjectRoot(context),
    command: 'kraft cloud instance stop',
    color: true,
    args: toArgs(options).concat([context.projectName]),
    __unparsed__: [],
  }, context);
};

export default runExecutor;
