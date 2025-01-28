import { PromiseExecutor } from '@nx/devkit';
import { GetProjectRoot } from '@rxap/plugin-utilities';
import { toArgs } from '../to-args';
import run from 'nx/src/executors/run-commands/run-commands.impl';
import { CloudInstanceStartExecutorSchema } from './schema';

const runExecutor: PromiseExecutor<CloudInstanceStartExecutorSchema> = async (
  options, context
) => {
  console.log('Executor ran for CloudInstanceStart', options);
  return run({
    cwd: GetProjectRoot(context),
    command: 'kraft cloud instance start',
    color: true,
    args: toArgs(options).concat([context.projectName]),
    __unparsed__: [],
  }, context);
};

export default runExecutor;
