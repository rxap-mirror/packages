import { ExecutorContext } from '@nx/devkit';
import { IsRxapRepository } from '@rxap/workspace-utilities';
import run from 'nx/src/executors/run-commands/run-commands.impl';
import { RunGeneratorExecutorSchema } from './schema';

function buildParameters(options: Record<string, unknown> = {}): string {
  const params = [];
  for (const [ key, value ] of Object.entries(options)) {
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

  let command = `nx g ${ options.generator }`;

  if (IsRxapRepository(context.root)) {
    if (options.generator.match(/@rxap\/schematic/)) {
      command = `yarn schematic ${ options.generator }`;
    }
  }

  options.options ??= {};

  if (!options.withoutProjectArgument) {
    options.options['project'] ??= context.projectName;
  }

  command += ` ${ buildParameters(options.options) }`;

  if (options.dryRun) {
    command += ' --dry-run';
  }

  console.log('command: ', command);

  return run({
    cwd: context.root,
    command,
    __unparsed__: [],
  }, context);
}
