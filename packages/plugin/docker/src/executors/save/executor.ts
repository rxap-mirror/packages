import { SaveExecutorSchema } from './schema';
import { ExecutorContext } from '@nx/devkit';
import {
  GetProjectConfiguration,
  GetTarget,
  GetTargetOptions,
} from '@rxap/plugin-utilities';
import {
  dockerSave,
  getGitlabRegistryDestination,
} from '../utilities';

function getOutputName(options: SaveExecutorSchema, context: ExecutorContext): string {
  const project = context.projectName;
  if (!options.outputPath) {
    options.outputPath = `${ context.root }/dist/docker`;
  }
  return `${ options.outputPath }/${ project }.tar.gz`;
}

export default async function runExecutor(
  options: SaveExecutorSchema,
  context: ExecutorContext,
) {

  const destinationList: string[] = [];
  const fallbackImageName = 'docker';
  const projectConfiguration = GetProjectConfiguration(context);
  const buildTarget = GetTarget(projectConfiguration, 'docker');
  const buildTargetOptions = GetTargetOptions(buildTarget, context.configurationName);

  if (buildTargetOptions.imageRegistry) {
    if (buildTargetOptions.imageName) {
      buildTargetOptions.imageName = [
        buildTargetOptions.imageRegistry,
        buildTargetOptions.imageName,
      ].join('/');
    }
  }

  const tagList = buildTargetOptions.tag as string[];

  if (!tagList?.length) {
    console.log('create registry tag');
    destinationList.push(getGitlabRegistryDestination(
      options,
      fallbackImageName,
      undefined,
      context.configurationName,
      buildTargetOptions.imageName as string,
      buildTargetOptions.imageSuffix as string,
    ));
  } else {
    for (const tag of tagList) {
      destinationList.push(getGitlabRegistryDestination(
        options,
        fallbackImageName,
        tag,
        context.configurationName,
        buildTargetOptions.imageName as string,
        buildTargetOptions.imageSuffix as string,
      ));
    }
  }

  if (process.env.LATEST || buildTargetOptions.latest) {
    destinationList.push(getGitlabRegistryDestination(
      options,
      fallbackImageName,
      'latest',
      undefined,
      buildTargetOptions.imageName as string,
      buildTargetOptions.imageSuffix as string,
    ));
  }

  console.log(`start docker save for ${ destinationList.join(', ') }`);

  const result = await dockerSave(
    destinationList,
    getOutputName(options, context),
  );

  return { success: !Number(result) };

}
