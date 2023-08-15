import { ExecutorContext } from '@nx/devkit';
import { GuessOutputPath } from '@rxap/plugin-utilities';
import { join } from 'path';
import {
  dockerBuild,
  dockerPush,
  getFallBackImageTag,
  getGitlabRegistryDestination,
  loginToRegistry,
} from '../utilities';
import { BuildExecutorSchema } from './schema';


export default async function runExecutor(
  options: BuildExecutorSchema,
  context: ExecutorContext,
) {

  if (!options.context) {
    const outputPath = GuessOutputPath(context);

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

  if (options.dockerfile) {
    if (!options.dockerfile.startsWith('/')) {
      options.dockerfile = join(context.root, options.dockerfile);
    }
  }

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

  console.log(`start docker build for ${ options.dockerfile }`);

  let result = await dockerBuild(
    options.command,
    options.context,
    destinationList,
    options.dockerfile,
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
