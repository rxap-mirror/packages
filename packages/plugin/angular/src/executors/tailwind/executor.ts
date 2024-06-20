import { ExecutorContext } from '@nx/devkit';
import { GetProjectRoot } from '@rxap/plugin-utilities';
import { join } from 'path';
// @ts-expect-error - Tailwindcss does not have types
import { build } from 'tailwindcss/lib/cli/build';
import { TailwindExecutorSchema } from './schema';

export default async function runExecutor(options: TailwindExecutorSchema, context: ExecutorContext) {
  console.log('Executor ran for Tailwind', options);

  const projectRoot = GetProjectRoot(context);

  const args: Record<string, string | boolean | number> = {
    '--config': join(projectRoot, options.config),
    '--input': join(projectRoot, options.input),
    '--output': join(projectRoot, options.output),
  };

  if (options.minify) {
    args['--minify'] = true;
  }

  console.log('Running Tailwind with args', JSON.stringify(args, undefined, 2));

  await build(args);

  return { success: true };

  // return run({
  //   cwd: projectRoot,
  //   command,
  //   __unparsed__: [],
  // }, context);
}
