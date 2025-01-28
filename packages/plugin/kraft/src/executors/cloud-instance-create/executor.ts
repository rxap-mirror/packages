import { PromiseExecutor } from '@nx/devkit';
import { GetProjectRoot } from '@rxap/plugin-utilities';
import { toArgs } from '../to-args';
import { CloudInstanceCreateExecutorSchema } from './schema';
import run from 'nx/src/executors/run-commands/run-commands.impl';

const runExecutor: PromiseExecutor<CloudInstanceCreateExecutorSchema> = async (
  options, context
) => {
  console.log('Executor ran for CloudInstanceCreate', options);
  return run({
    cwd: GetProjectRoot(context),
    command: 'kraft cloud instance create',
    color: true,
    name: context.projectName,
    args: toArgs(options).concat([`\${UKC_USER}/${context.projectName}:latest`]),
    __unparsed__: [],
  }, context);
};

export default runExecutor;
