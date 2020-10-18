import {
  BuilderContext,
  BuilderOutput,
  createBuilder
} from '@angular-devkit/architect';
import { AppEngineDeployBuilderSchema } from './schema';
import { GCloud } from './gcloud';
import { Nx } from './nx';
import { join } from 'path';
import { CopyFile } from './copy-file';

export async function runBuilder(
  options: AppEngineDeployBuilderSchema,
  context: BuilderContext
): Promise<BuilderOutput> {

  const project: string | undefined       = context.target?.project;
  const configuration: string | undefined = context.target?.configuration;

  if (!project) {
    throw new Error('The target project is not defined!');
  }

  const buildTarget: { project: string, target: string, configuration?: string } = {
    project,
    configuration,
    target: 'build'
  };

  const deployOptions: AppEngineDeployBuilderSchema = await context.getTargetOptions(context.target as any);

  const overwrittenOptions = {
    ...deployOptions,
    ...options
  };

  const buildConfig = await context.getTargetOptions(buildTarget as any);

  const outputPath: string  = buildConfig.outputPath as string;
  const indexFile: string   = buildConfig.index as string;
  const appYamlFile: string = indexFile.replace(/index\.html/, 'app.yaml');

  if (!options.skipBuild) {

    const nx = new Nx(context.logger);

    try {
      await nx.build({ project, configuration });
    } catch (error) {
      context.logger.error('build target failed');
      return { success: false, error: error.message ?? 'unknown error', target: context.target! };
    }

  }

  const copyFile = new CopyFile();

  copyFile.sync(join(process.cwd(), appYamlFile), join(process.cwd(), outputPath, 'app.yaml'));

  const gCloud = new GCloud(context.logger);

  try {

    await gCloud.deploy({
      ...overwrittenOptions,
      cwd: outputPath
    });

  } catch (error) {
    context.logger.error('deployment failed');
    return { success: false, error: error.message ?? 'unknown error', target: context.target! };
  }

  return { success: true, target: context.target! };
}

export default createBuilder(runBuilder);
