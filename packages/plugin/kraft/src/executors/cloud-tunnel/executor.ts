import { PromiseExecutor } from '@nx/devkit';
import { GetProjectRoot } from '@rxap/plugin-utilities';
import { toArgs } from '../to-args';
import { CloudTunnelExecutorSchema } from './schema';
import run from 'nx/src/executors/run-commands/run-commands.impl';

const runExecutor: PromiseExecutor<CloudTunnelExecutorSchema> = async (
  options, context
) => {
  console.log('Executor ran for CloudTunnel', options);
  const { localPort, destPort, urlPath } = options;
  if ('localPort' in options) {
    delete options.localPort;
  }
  if ('destPort' in options) {
    delete options.destPort;
  }
  if ('urlPath' in options) {
    delete options.urlPath;
  }
  let tunnel = `${context.projectName}:${destPort}`;
  if (localPort) {
    tunnel = `${tunnel}:${localPort}`;
  }
  console.log(`Access with http://localhost:${localPort ?? destPort.replace(/\/.+$/, '')}/${urlPath.replace(/^\//, '')}`);
  return run({
    cwd: GetProjectRoot(context),
    command: 'kraft cloud tunnel',
    color: true,
    args: toArgs(options).concat(tunnel),
    __unparsed__: [],
  }, context);
};

export default runExecutor;
