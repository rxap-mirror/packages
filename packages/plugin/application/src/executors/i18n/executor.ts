import { ExecutorContext } from '@nx/devkit';
import {
  GetProjectTargetOptions,
  GuessOutputPathFromContext,
} from '@rxap/plugin-utilities';
import {
  existsSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import { copy } from 'fs-extra';
import { glob } from 'glob';
import { compile } from 'handlebars';
import {
  basename,
  join,
  relative,
} from 'path';
import { I18nExecutorSchema } from './schema';

async function createIndexHtml(
  options: I18nExecutorSchema,
  context: ExecutorContext,
) {
  const indexHtmlTemplateFilePath = options.indexHtmlTemplate;

  if (!indexHtmlTemplateFilePath) {
    throw new Error('The i18n index html template path is not defined');
  }

  const indexHtmlTemplateAbsoluteFilePath = join(context.root, indexHtmlTemplateFilePath);

  if (!existsSync(indexHtmlTemplateAbsoluteFilePath)) {
    throw new Error(`Could not find the i18n index html template in '${ indexHtmlTemplateAbsoluteFilePath }'`);
  }

  const indexHtmlTemplateFile = readFileSync(indexHtmlTemplateAbsoluteFilePath).toString('utf-8');

  const indexHtmlTemplate = compile(indexHtmlTemplateFile);

  const indexHtml = indexHtmlTemplate(options);

  if (!options.outputPath) {
    throw new Error('The i18n output path is not defined');
  }

  const indexHtmlFilePath = join(context.root, options.outputPath, 'index.html');

  if (existsSync(indexHtmlFilePath)) {
    console.warn(`The index.html file already exists in the location: '${ indexHtmlFilePath }'`);
  }

  writeFileSync(indexHtmlFilePath, indexHtml);
}

async function copyFiles(
  { outputPath }: I18nExecutorSchema,
  pathList: Array<string | { glob: string, input: string, output: string }>,
) {
  await Promise.all(pathList.map(async assetPath => {
    if (typeof assetPath === 'string') {
      if (!outputPath) {
        throw new Error('The i18n output path is not defined');
      }
      const assetOutputPath = join(outputPath, basename(assetPath));
      try {
        await copy(assetPath, assetOutputPath);
      } catch (e: any) {
        throw new Error(`Could not copy assets '${ assetPath }' to '${ outputPath }': ${ e.message }`);
      }
    } else {
      if (!outputPath) {
        throw new Error('The i18n output path is not defined');
      }
      const assetOutputPath = join(outputPath, assetPath.output);
      try {
        const files = await glob(assetPath.input + assetPath.glob);
        await Promise.all(files.map(file => copy(file, join(assetOutputPath, relative(assetPath.input, file)))));
      } catch (e: any) {
        throw new Error(`Could not copy assets '${ JSON.stringify(assetPath) }' to '${ outputPath }': ${ e.message }`);
      }
    }
  }));
}

async function copyAssets(
  options: I18nExecutorSchema,
  context: ExecutorContext,
) {

  if (Array.isArray(options.assets) && options.assets.length) {
    await copyFiles(options, options.assets);
  } else if (typeof options.assets === 'boolean' && options.assets) {

    if (!context.target) {
      throw new Error('The current builder target is not defined in the context');
    }

    if (!context.projectName) {
      throw new Error('The current project name is not defined in the context');
    }

    const buildOptions = GetProjectTargetOptions(context, context.projectName, 'build');

    if (Array.isArray(buildOptions.assets) && buildOptions.assets.length) {
      await copyFiles(options, buildOptions.assets);
    } else {
      console.info('Skip assets copy. The build target of this project has no assets specified.');
    }

  } else {
    console.info('Skip assets copy. No assets specified.');
  }

}

export default async function runExecutor(
  options: I18nExecutorSchema,
  context: ExecutorContext,
) {
  console.log('Executor ran for I18n', options);

  options.outputPath ??= GuessOutputPathFromContext(context);

  try {
    await createIndexHtml(options, context);
  } catch (e: any) {
    console.error(`Create index html failed: ${e.message}`);
    return {
      success: false,
      error: e.message,
    };
  }

  try {
    await copyAssets(options, context);
  } catch (e: any) {
    console.error(`Copy assets failed: ${ e.message }`);
    return {
      success: false,
      error: e.message,
    };
  }

  return {
    success: true,
  };
}
