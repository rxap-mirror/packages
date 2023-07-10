import { GetProjectConfiguration } from './project';
import { ExecutorContext } from '@nx/devkit';
import { GetTargetOptions } from './get-target-configuration-name-list';


export function GuessOutputPath(context: ExecutorContext) {

  const project = GetProjectConfiguration(context);

  if (!project.targets) {
    throw new Error(`Could not guess the output path. The project ${ project.name } does not have any targets`);
  }

  const buildTarget = project.targets['build'];

  if (!buildTarget) {
    throw new Error(`Could not find target 'build' for project '${ project.name }'`);
  }

  let outputPath = GetTargetOptions(buildTarget, context.configurationName)['outputPath'];

  if (!outputPath) {
    console.warn('Could not find outputPath in build target options.');
    if (buildTarget.outputs && buildTarget.outputs.length) {
      const [ output ] = buildTarget.outputs;
      outputPath = output;
    } else {
      throw new Error('Could not find outputPath in build target options and target outputs are not defined.');
    }
  }

  if (typeof outputPath !== 'string') {
    throw new Error(`The outputPath is not a string. Found: ${ outputPath }`);
  }

  return outputPath;

}
