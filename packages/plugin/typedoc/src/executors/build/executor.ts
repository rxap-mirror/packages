import {
  ExecutorContext,
  PromiseExecutor,
} from '@nx/devkit';
import {
  GetProjectRoot,
  GetProjectSourceRoot,
} from '@rxap/plugin-utilities';
import { rm } from 'fs/promises';
import run from 'nx/src/executors/run-commands/run-commands.impl';
import { join } from 'path';
import {
  BuildEntryPointStrategyExecutorSchemaEnum,
  BuildExecutorSchema,
} from './schema';

function toArgs(options: any): string[] {
  const args: string[] = [];

  for (const [key,value] of Object.entries(options)) {

    if (Array.isArray(value)) {
      for (const item of value) {
        args.push(`--${key} ${item}`);
      }
    } else {
      if (typeof value === 'boolean') {
        if (value) {
          args.push(`--${key}`);
        } else {
          args.push(`--${key} ${value}`);
        }
      } else {
        args.push(`--${ key } ${ value }`);
      }
    }

  }

  return args;
}

const runExecutor: PromiseExecutor<BuildExecutorSchema> = async (options, context: ExecutorContext) => {
  console.log('Executor ran for Build', options);

  const projectRoot = GetProjectRoot(context);

  if (!options.outputPaths?.length) {
    options.outputPaths = [ join(projectRoot, 'docs') ];
  }

  const { outputPaths, html, json, plugins, markdown, wiki, ...argOptions } = options;

  for (const outputPath of outputPaths) {

    await rm(outputPath, { recursive: true, force: true });

    if (json) {
      const result = await run({
        command: 'typedoc',
        color: true,
        args: toArgs(argOptions).concat(`--json ${join(outputPath, 'documentation.json')}`),
        __unparsed__: [],
      }, context);
      if (!result.success) {
        return {
          ...result,
          success: false
        };
      }
    }

    if (html) {
      const result = await run({
        command: 'typedoc',
        color: true,
        args: toArgs(argOptions).concat(`--html ${join(outputPath, 'html')}`),
        __unparsed__: [],
      }, context);
      if (!result.success) {
        return {
          ...result,
          success: false
        };
      }
    }

    if (markdown) {
      const result = await run({
        command: 'typedoc',
        color: true,
        args: toArgs(argOptions).concat(
          `--out ${join(outputPath, 'markdown')}`,
          '--plugin typedoc-plugin-markdown'
        ),
        __unparsed__: [],
      }, context);
      if (!result.success) {
        return {
          ...result,
          success: false
        };
      }
    }

    if (wiki) {
      const result = await run({
        command: 'typedoc',
        color: true,
        args: toArgs(argOptions).concat(
          `--out ${join(outputPath, 'wiki')}`,
          '--plugin typedoc-plugin-markdown',
          '--plugin typedoc-github-wiki-theme',
        ),
        __unparsed__: [],
      }, context);
      if (!result.success) {
        return {
          ...result,
          success: false
        };
      }
    }

    if (plugins?.length) {
      const result = await run({
        command: 'typedoc',
        color: true,
        args: toArgs(argOptions).concat(
          `--out ${outputPath}`,
          ...plugins.map(plugin => `--plugin ${plugin}`)
        ),
        __unparsed__: [],
      }, context);
      if (!result.success) {
        return {
          ...result,
          success: false
        };
      }
    }
  }

  return {
    success: true
  };
};

export default runExecutor;
