import {
  ExecutorContext,
  TargetConfiguration,
} from '@nx/devkit';
import {
  dirname,
  join,
} from 'path';
import { GetTargetOptions } from './get-target-configuration-name-list';
import { GetProjectRoot } from './project';
import { GetProjectTarget } from './project-target';


export function GuessOutputPathFromContext(
  context: ExecutorContext,
  projectName = context.projectName,
  configurationName = context.configurationName,
): string {

  if (!projectName) {
    throw new Error('The projectName is undefined. Ensure the projectName is passed into the executor context.');
  }

  const buildTarget = GetProjectTarget(context, projectName, 'build');

  if (!buildTarget) {
    throw new Error(`Could not find target 'build' for project '${ projectName }'`);
  }

  const projectRoot = GetProjectRoot(context, projectName);

  return GuessOutputPath(projectRoot, buildTarget, configurationName);

}

export function GuessOutputPath(projectRoot: string, buildTarget: TargetConfiguration, configurationName?: string) {

  let outputPath = GetTargetOptions(buildTarget, configurationName)['outputPath'];

  if (!outputPath) {
    if (buildTarget.outputs && buildTarget.outputs.length) {
      const [ output ] = buildTarget.outputs;
      if (output.match(/\.[a-zA-Z]+$/)) {
        outputPath = dirname(output);
      } else {
        outputPath = output;
      }
    } else {
      outputPath = join('dist', projectRoot);
    }
  }

  if (typeof outputPath !== 'string') {
    throw new Error(`The outputPath is not a string. Found: ${ outputPath }`);
  }

  return outputPath
    .replace(/\{projectRoot}/, projectRoot)
    .replace(/\{workspaceRoot}\//, '');

}
