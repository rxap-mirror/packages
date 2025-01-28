import { PromiseExecutor } from '@nx/devkit';
import { GetProjectRoot } from '@rxap/plugin-utilities';
import { toArgs } from '../to-args';
import { CloudImgRemoveExecutorSchema } from './schema';
import run from 'nx/src/executors/run-commands/run-commands.impl';

const runExecutor: PromiseExecutor<CloudImgRemoveExecutorSchema> = async (
  options, context
) => {
  console.log('Executor ran for CloudImgRemove', options);
  return run({
    cwd: GetProjectRoot(context),
    command: 'kraft cloud img remove',
    color: true,
    args: toArgs(options).concat(context.projectName),
    __unparsed__: [],
  }, context);
};

export default runExecutor;
