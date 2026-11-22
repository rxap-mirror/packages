import type { ExecutorContext } from '@nx/devkit';
import type { NodeExecutorOptions } from '@nx/js/executors';
import { dirname, join } from 'path';

type NodeExecutor = (
  options: NodeExecutorOptions,
  context: ExecutorContext,
) => AsyncGenerator<{ success: boolean; options?: Record<string, any> }, void, any>;

/**
 * Since Nx 23 the implementation of the `@nx/js:node` executor is no longer part of the public export map of
 * `@nx/js`. The swagger-generate executor needs to start the built application, so the implementation is loaded
 * directly from the installed package.
 */
export default function nodeExecutor(
  options: NodeExecutorOptions,
  context: ExecutorContext,
) {
  const impl = require(
    join(
      dirname(require.resolve('@nx/js/package.json')),
      'dist/src/executors/node/node.impl.js',
    ),
  );
  return (impl.default ?? impl.nodeExecutor as NodeExecutor)(options, context);
}
