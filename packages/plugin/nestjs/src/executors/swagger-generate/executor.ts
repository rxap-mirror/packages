import {
  ExecutorContext,
  runExecutor as RunExecutor,
} from '@nx/devkit';
import nodeExecutor from '@nx/js/src/executors/node/node.impl';
import {
  GetDependentProjectsForProject,
  GetProjectRoot,
  GuessOutputPathFromContext,
} from '@rxap/plugin-utilities';
import { existsSync } from 'fs';
import { join } from 'path';
import { isLegacyConfiguration } from '../is-legacy-configuration';
import { SwaggerGenerateExecutorSchema } from './schema';
import run from 'nx/src/executors/run-commands/run-commands.impl';

function checkIfOpenApiFileExists(context: ExecutorContext): boolean {
  const outputPath = GuessOutputPathFromContext(context, undefined, undefined, 'swagger-build');
  const openApiPath = join(outputPath, 'openapi.json');
  const fullPath = join(context.root, openApiPath);
  console.log('Checking if OpenAPI file exists at', fullPath);
  return existsSync(fullPath);
}

async function linkLibrariesToDistNodeModules(context: ExecutorContext) {
  const dependentProjects = GetDependentProjectsForProject(context)
    .filter(project => context.projectsConfigurations?.projects[project]?.targets?.['linking'])
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

  const projectRoot = GetProjectRoot(context);
  const projectName = context.projectName!;

  await linkLibrariesToDistNodeModules(context);

  // This will give a random number between 9000 and 9999
  const port = Math.floor(Math.random() * 1000) + 9000;

  if (isLegacyConfiguration(context)) {
    const nodeProc = nodeExecutor({
      watch: false,
      buildTarget: options.buildTarget ?? `${ projectName }:swagger-build`,
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
  } else {
    const result = await run({
      cwd: context.root,
      command: 'node',
      env: {
        PORT: port.toFixed(0),
      },
      args: [
        join('swagger', projectRoot || projectName, 'main.js'),
      ],
      __unparsed__: [],
    }, context);

    if (!result.success) {
      console.log('Failed to run the swagger node application');
      return result;
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
