import { ExecutorContext } from '@nx/devkit';
import { GetTargetOptions } from './get-target-configuration-name-list';
import { GetProjectTarget } from './project-target';


export function GuessOutputPath(context: ExecutorContext, projectName = context.projectName) {

  if (!projectName) {
    throw new Error('The projectName is undefined. Ensure the projectName is passed into the executor context.');
  }

  const buildTarget = GetProjectTarget(context, projectName, 'build');

  if (!buildTarget) {
    throw new Error(`Could not find target 'build' for project '${ projectName }'`);
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
