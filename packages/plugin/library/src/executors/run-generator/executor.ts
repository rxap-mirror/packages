import { ExecutorContext } from '@nx/devkit';
import {
  GetProjectRoot,
  GetProjectSourceRoot,
} from '@rxap/plugin-utilities';
import { IsRxapRepository } from '@rxap/workspace-utilities';
import run from 'nx/src/executors/run-commands/run-commands.impl';
import { RunGeneratorExecutorSchema } from './schema';

function buildParameters(options: Record<string, unknown> = {}): string {
  const params = [];
  for (const [ key, value ] of Object.entries(options)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'object') {
          params.push(`--${ key }='${ JSON.stringify(item) }'`);
        } else {
          params.push(`--${ key }='${ item }'`);
        }
      }
    } else if (typeof value === 'object') {
      params.push(`--${ key }='${ JSON.stringify(value) }'`);
    } else {
      params.push(`--${ key }='${ value }'`);
    }
  }
  return params.join(' ');
}

function stringInterpolation(options: Record<string, any>, params: Record<string, string>) {
  if (!options) {
    return;
  }
  for (const [ key, value ] of Object.entries(options)) {
    if (typeof value === 'string') {
      options[key] = value.replace(/\{([^}]+)}/g, (match, property) => {
        if (!params[property]) {
          throw new Error(`Could not find property ${ property } in possible string interpolation parameters: ${ JSON.stringify(
            params) }`);
        }
        return params[property];
      });
    }
  }
}

function extractFlattenOptions(options: Record<string, any>): Record<string, any> {
  const extracted: Record<string, any> = {};
  for (const [ option, value ] of Object.entries(options)) {
    let key: string | undefined = undefined;
    if (option.startsWith('options-')) {
      key = option.replace('options-', '');
    }
    if (option.startsWith('option-')) {
      key = option.replace('option-', '');
    }
    if (option.match(/option[A-Z]/)) {
      key = option.replace(/option([A-Z])/g, (match, letter) => letter.toLowerCase());
    }
    if (option.match(/options[A-Z]/)) {
      key = option.replace(/options([A-Z])/g, (match, letter) => letter.toLowerCase());
    }
    if (key) {
      extracted[key] = value;
    }
  }
  return extracted;
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

  if (!context.projectName) {
    console.error(`No project name found in the context`);
    return {
      success: false,
    };
  }

  if (!context.targetName) {
    console.error(`No target name found in the context`);
    return {
      success: false,
    };
  }

  if (!context.configurationName) {
    console.warn(`No configuration name found in the context`);
  }

  stringInterpolation(options.options, {
    workspaceRoot: context.root,
    projectRoot: GetProjectRoot(context),
    projectSourceRoot: GetProjectSourceRoot(context),
    projectName: context.projectName,
    configurationName: context.configurationName ?? '',
    cwd: context.cwd,
    targetName: context.targetName,
  });

  command += ` ${ buildParameters({
    ...options.options,
    ...extractFlattenOptions(options),
  }) }`;

  if (options.dryRun) {
    command += ' --dry-run';
  }

  if (options.verbose) {
    command += ' --verbose';
  }

  console.log('command: ', command);

  return run({
    cwd: context.root,
    command,
    __unparsed__: [],
  }, context);
}
