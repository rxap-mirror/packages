import { ExecutorContext } from '@nx/devkit';
import { GetProjectRoot } from '@rxap/plugin-utilities';
import run from 'nx/src/executors/run-commands/run-commands.impl';
import { TailwindExecutorSchema } from './schema';

export default async function runExecutor(options: TailwindExecutorSchema, context: ExecutorContext) {
  console.log('Executor ran for Tailwind', options);

  const projectRoot = GetProjectRoot(context);

  const args = [
    [ 'config', options.config ],
    [ 'input', options.input ],
    [ 'output', options.output ],
  ];

  if (options.minify) {
    args.push([ 'minify' ]);
  }

  const argsString = args.map(([ key, value ]) => value ? `--${ key } ${ value }` : `--${ key }`).join(' ');

  const command = `tailwindcss ${ argsString }`;

  console.log('command: ', command);

  return run({
    cwd: projectRoot,
    command,
    __unparsed__: [],
  }, context);
}
