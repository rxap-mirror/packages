import {
  ExecutorContext,
  runExecutor as RunExecutor,
} from '@nx/devkit';
import nodeExecutor from '@nx/js/src/executors/node/node.impl';
import {
  GetDependentProjectsForProject,
  GuessOutputPathFromContext,
} from '@rxap/plugin-utilities';
import { existsSync } from 'fs';
import { join } from 'path';
import { SwaggerGenerateExecutorSchema } from './schema';

function checkIfOpenApiFileExists(context: ExecutorContext): boolean {
  const outputPath = GuessOutputPathFromContext(context, undefined, undefined, 'swagger-build');
  const openApiPath = join(outputPath, 'openapi.json');
  const fullPath = join(context.root, openApiPath);
  console.log('Checking if OpenAPI file exists at', fullPath);
  return existsSync(fullPath);
}

async function linkLibrariesToDistNodeModules(context: ExecutorContext) {
  const dependentProjects = GetDependentProjectsForProject(context)
    .map(name => ({ project: name, target: 'linking' }));

  console.log('Dependent projects', dependentProjects);

  for (const target of dependentProjects) {
    console.log('Running executor for', target.project);
    await RunExecutor(target, {}, context);
  }
}

export default async function runExecutor(
  options: SwaggerGenerateExecutorSchema,
  context: ExecutorContext
) {
  console.log('Executor ran for SwaggerGenerate', options);

  const projectName = context.projectName;

  await linkLibrariesToDistNodeModules(context);

  // This will give a random number between 9000 and 9999
  const port = Math.floor(Math.random() * 1000) + 9000;

  const nodeProc = nodeExecutor({
    watch: false,
    buildTarget: `${projectName}:swagger-build`,
    inspect: false,
    runtimeArgs: [],
    args: [],
    waitUntilTargets: [],
    buildTargetOptions: {},
    host: 'localhost',
    port: port
  }, context);

  for await (const event of nodeProc) {
    console.log('Node executor event', event);
    if (!event.success) {
      console.log('Node executor target was not successful');
      return {
        success: false,
      };
    }
  }

  if (checkIfOpenApiFileExists(context)) {
    console.log('OpenAPI file exists');
    return {
      success: true,
    };
  } else {
    console.log('OpenAPI file does not exist');
  }

  return {
    success: false,
  };
}
