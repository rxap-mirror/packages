import { PromiseExecutor } from '@nx/devkit';
import { GetProjectRoot } from '@rxap/plugin-utilities';
import { CloudDeployExecutorSchema } from './schema';
import run from 'nx/src/executors/run-commands/run-commands.impl';
import { toArgs } from '../to-args';

const runExecutor: PromiseExecutor<CloudDeployExecutorSchema> = async (
  options, context,
) => {
  console.log('Executor ran for CloudDeploy', options);
  return run({
    cwd: GetProjectRoot(context),
    command: 'kraft cloud deploy',
    color: true,
    name: context.projectName,
    args: toArgs(options),
    __unparsed__: [],
  }, context);
};

export default runExecutor;
