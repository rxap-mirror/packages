import { PromiseExecutor } from '@nx/devkit';
import { BuildExecutorSchema } from './schema';
import { Application } from 'typedoc';

const runExecutor: PromiseExecutor<BuildExecutorSchema> = async (options) => {
  console.log('Executor ran for Build', options);

  const app = await Application.bootstrapWithPlugins({
    entryPoints: ["src/index.ts"],
  });

  const project = await app.convert();

  if (!project) {
    return { success: false };
  }
  // Project may not have converted correctly
  const outputDir = "docs";

  // Rendered docs
  await app.generateDocs(project, outputDir);
  // Alternatively generate JSON output
  await app.generateJson(project, outputDir + "/documentation.json");

  return {
    success: true,
  };
};

export default runExecutor;
