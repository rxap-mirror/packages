import { PromiseExecutor } from '@nx/devkit';
import { GetProjectRoot } from '@rxap/plugin-utilities';
import { toArgs } from '../to-args';
import run from 'nx/src/executors/run-commands/run-commands.impl';
import { CloudInstanceLogsExecutorSchema } from './schema';

const runExecutor: PromiseExecutor<CloudInstanceLogsExecutorSchema> = async (
  options, context
) => {
  console.log('Executor ran for CloudInstanceLogs', options);
  return run({
    cwd: GetProjectRoot(context),
    command: 'kraft cloud instance logs',
    color: true,
    args: toArgs(options).concat([context.projectName]),
    __unparsed__: [],
  }, context);
};

export default runExecutor;
