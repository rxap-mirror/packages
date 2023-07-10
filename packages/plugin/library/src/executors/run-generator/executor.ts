import { RunGeneratorExecutorSchema } from './schema';
import run from 'nx/src/executors/run-commands/run-commands.impl';
import { ExecutorContext } from '@nx/devkit';

function buildParameters(options: Record<string, unknown> = {}): string {
  const params = [];
  for (const [ key, value ] of Object.entries(options)) {
    if (key === 'project') {
      console.log('skip project option');
      continue;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        params.push(`--${ key }=${ item }`);
      }
    } else if (typeof value === 'object') {
      params.push(`--${ key }=${ JSON.stringify(value) }`);
    } else {
      params.push(`--${ key }=${ value }`);
    }
  }
  return params.join(' ');
}

export default async function runExecutor(options: RunGeneratorExecutorSchema, context: ExecutorContext) {
  console.log('Executor ran for RunGenerator', options);

  return run({
               cwd: context.root,
               command: `nx g ${ options.generator } --project ${ context.projectName } ${ buildParameters(options.options) }`,
               __unparsed__: [],
             }, context);
}
