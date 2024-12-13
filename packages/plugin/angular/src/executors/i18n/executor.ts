import { ExecutorContext } from '@nx/devkit';
import {
  GetProjectSourceRoot,
  GetProjectTargetOptions,
  GuessOutputPathFromTargetString,
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

function getIndexHtmlTemplateFilePath(indexHtmlTemplate: string, context: ExecutorContext) {
  if (existsSync(join(context.root, indexHtmlTemplate))) {
    return join(context.root, indexHtmlTemplate);
  }
  if (existsSync(join(context.root, 'shared', indexHtmlTemplate))) {
    return join(context.root, 'shared', indexHtmlTemplate);
  }
  if (existsSync(join(context.root, 'shared', 'angular', indexHtmlTemplate))) {
    return join(context.root, 'shared', 'angular', indexHtmlTemplate);
  }
  const projectSourceRoot = GetProjectSourceRoot(context);
  if (existsSync(join(projectSourceRoot, indexHtmlTemplate))) {
    return join(projectSourceRoot, indexHtmlTemplate);
  }
  throw new Error(`Could not find the i18n index html template with path '${ indexHtmlTemplate }'`);
}

async function createIndexHtml(
  options: I18nExecutorSchema,
  context: ExecutorContext,
  outputPath: string,
) {
  const indexHtmlTemplateFilePath = options.indexHtmlTemplate ?? 'i18n.index.html.hbs';

  if (!indexHtmlTemplateFilePath) {
    throw new Error('The i18n index html template path is not defined');
  }

  const indexHtmlTemplateAbsoluteFilePath = getIndexHtmlTemplateFilePath(indexHtmlTemplateFilePath, context);

  const indexHtmlTemplateFile = readFileSync(indexHtmlTemplateAbsoluteFilePath).toString('utf-8');

  const indexHtmlTemplate = compile(indexHtmlTemplateFile);

  const indexHtml = indexHtmlTemplate(options);

  const indexHtmlFilePath = join(context.root, outputPath, 'index.html');

  if (existsSync(indexHtmlFilePath)) {
    console.warn(`The index.html file already exists in the location: '${ indexHtmlFilePath }'`);
  }

  writeFileSync(indexHtmlFilePath, indexHtml);
}

async function copyFiles(
  outputPath: string,
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
  outputPath: string,
  options: I18nExecutorSchema,
  context: ExecutorContext,
) {

  if (Array.isArray(options.assets) && options.assets.length) {
    await copyFiles(outputPath, options.assets);
  } else if (typeof options.assets === 'boolean' && options.assets) {

    if (!context.target) {
      throw new Error('The current builder target is not defined in the context');
    }

    if (!context.projectName) {
      throw new Error('The current project name is not defined in the context');
    }

    const buildOptions = GetProjectTargetOptions(context, context.projectName, 'build');

    if (Array.isArray(buildOptions.assets) && buildOptions.assets.length) {
      await copyFiles(outputPath, buildOptions.assets);
    } else {
      console.info('Skip assets copy. The build target of this project has no assets specified.');
    }

  } else {
    console.info('Skip assets copy. No assets specified.');
  }

}

function coerceDefaultLanguage(options: I18nExecutorSchema) {
  options.defaultLanguage ??= options.availableLanguages?.[0];
}

function coerceAvailableLanguages(options: I18nExecutorSchema, context: ExecutorContext) {

  if (!options.availableLanguages) {
    const buildTarget = options.buildTarget ?? context.projectName + ':build';
    const targetName = buildTarget.split(':')[1];
    const buildOptions = GetProjectTargetOptions(
      context,
      context.projectName,
      targetName,
      context.configurationName ?? 'production'
    );
    const localize = buildOptions.localize;
    if (localize && Array.isArray(localize) && localize.length) {
      options.availableLanguages = localize;
    } else if (options.defaultLanguage) {
      options.availableLanguages = [ options.defaultLanguage ];
    }

  }

}

export default async function runExecutor(
  options: I18nExecutorSchema,
  context: ExecutorContext,
) {
  console.log('Executor ran for I18n', options);

  coerceAvailableLanguages(options, context);

  if (!options.availableLanguages?.length) {
    throw new Error('The available languages are not defined');
  }

  coerceDefaultLanguage(options);

  if (!options.defaultLanguage) {
    throw new Error('The default language is not defined');
  }

  const outputPath = GuessOutputPathFromTargetString(context, options.buildTarget);

  try {
    await createIndexHtml(options, context, outputPath);
  } catch (e: any) {
    console.error(`Create index html failed: ${e.message}`);
    return {
      success: false,
      error: e.message,
    };
  }

  try {
    await copyAssets(outputPath, options, context);
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
