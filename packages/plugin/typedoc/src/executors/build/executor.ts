import {
  ExecutorContext,
  PromiseExecutor,
} from '@nx/devkit';
import {
  GetProjectRoot,
  GetProjectSourceRoot,
} from '@rxap/plugin-utilities';
import { coerceArray } from '@rxap/utilities';
import { join } from 'path';
import { Application } from 'typedoc';
import { BuildExecutorSchema } from './schema';

const runExecutor: PromiseExecutor<BuildExecutorSchema> = async (options, context: ExecutorContext) => {
  console.log('Executor ran for Build', options);

  const projectSourceRoot = GetProjectSourceRoot(context);
  const projectRoot = GetProjectRoot(context);

  const entryPoints = options.entryPoints ?? [];
  if (entryPoints.length === 0) {
    entryPoints.push(join(projectSourceRoot, 'index.ts'));
  }

  const outputPath = coerceArray(options.outputPath);

  if (outputPath.length === 0) {
    const outputDir = projectRoot === '/' ? context.projectName : projectRoot;
    outputPath.push(join('dist', 'docs', outputDir));
  }

  console.log('entryPoints:', entryPoints);

  console.debug('Creating Application');
  const app = await Application.bootstrapWithPlugins({
    entryPoints: entryPoints,//.map(entryPoint => relative(projectRoot, entryPoint)),
    skipErrorChecking: true,
  });

  console.debug('Converting');
  const project = await app.convert();

  if (!project) {
    return { success: false };
  }

  for (const path of outputPath) {
    console.log('Generating docs at:', path);
    // Rendered docs
    await app.generateDocs(project, path);
    // Alternatively, generate JSON output
    await app.generateJson(project, join(path, `documentation.json`));
  }

  return {
    success: true,
  };
};

export default runExecutor;
