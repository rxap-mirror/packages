import { ExecutorContext } from '@nx/devkit';
import {
  GetProjectRoot,
  GetProjectSourceRoot,
  GuessOutputPathFromContext,
} from '@rxap/plugin-utilities';
import { ProcessBuildArgs } from '@rxap/workspace-utilities';
import { existsSync } from 'fs';
import { join } from 'path';
import {
  dockerBuild,
  dockerPush,
  getFallBackImageTag,
  getGitlabRegistryDestination,
  loginToRegistry,
} from '../../lib/utilities';
import { BuildExecutorSchema } from './schema';


export default async function runExecutor(
  options: BuildExecutorSchema,
  context: ExecutorContext,
) {

  if (!options.context) {
    const outputPath = GuessOutputPathFromContext(context);

    console.log(`Using output path: ${ outputPath }`);

    options.context = join(context.root, outputPath);
  }

  if (options.imageRegistry) {
    if (options.imageName) {
      options.imageName = [
        options.imageRegistry,
        options.imageName,
      ].join('/');
    }
  }

  if (!options.dockerfile) {
    if (existsSync(join(GetProjectRoot(context), 'Dockerfile'))) {
      options.dockerfile = join(GetProjectRoot(context), 'Dockerfile');
    }
  }

  if (options.dockerfile) {
    if (!options.dockerfile.startsWith('/')) {
      options.dockerfile = join(context.root, options.dockerfile);
    }
    console.log(`Using dockerfile: ${ options.dockerfile }`);
  } else {
    console.log('No dockerfile specified');
  }

  console.log('Executor ran for Build', options);

  console.log('login to registry');

  await loginToRegistry(options);

  const destinationList: string[] = [];
  const fallbackImageName = context.projectName;
  const fallbackImageTag = await getFallBackImageTag(context);

  if (options.tag && !Array.isArray(options.tag)) {
    options.tag = [ options.tag ];
  }

  if (!options.tag?.length) {
    console.log('create registry tag');
    destinationList.push(getGitlabRegistryDestination(
      options,
      fallbackImageName,
      undefined,
      fallbackImageTag,
    ));
  } else {
    console.log('Using provided tags');
    for (const tag of options.tag) {
      destinationList.push(getGitlabRegistryDestination(
        options,
        fallbackImageName,
        tag,
        fallbackImageTag,
      ));
    }
  }

  if (process.env.LATEST || options.latest) {
    destinationList.push(getGitlabRegistryDestination(
      options,
      fallbackImageName,
      'latest',
    ));
  }

  console.log(`start docker build`);

  let result = await dockerBuild(
    options.command,
    options.context,
    destinationList,
    options.dockerfile,
    ProcessBuildArgs(options.buildArgList, context.projectName, GetProjectSourceRoot(context)),
  );

  if (Number(result)) {
    return { success: false };
  }

  if (options.push) {
    result = await dockerPush(
      options.command,
      destinationList,
    );
  }

  return { success: !Number(result) };
}
