import { PromiseExecutor } from '@nx/devkit';
import { GetProjectRoot } from '@rxap/plugin-utilities';
import { toArgs } from '../to-args';
import { CloudInstanceRemoveExecutorSchema } from './schema';
import run from 'nx/src/executors/run-commands/run-commands.impl';

const runExecutor: PromiseExecutor<CloudInstanceRemoveExecutorSchema> = async (
  options, context
) => {
  console.log('Executor ran for CloudInstanceRemove', options);
  return run({
    cwd: GetProjectRoot(context),
    command: 'kraft cloud instance remove',
    color: true,
    args: toArgs(options).concat([context.projectName]),
    __unparsed__: [],
  }, context);
};

export default runExecutor;
