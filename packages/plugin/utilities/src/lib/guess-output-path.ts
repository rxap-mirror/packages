import {
  ExecutorContext,
  TargetConfiguration,
} from '@nx/devkit';
import { GetTargetOptions } from '@rxap/workspace-utilities';
import {
  dirname,
  join,
} from 'path';
import {
  GetProjectRoot,
  GetProjectSourceRoot,
} from './project';
import {
  GetProjectTarget,
  HasProjectTarget,
} from './project-target';

export function GuessOutputPathFromContext(
  context: ExecutorContext,
  projectName = context.projectName,
  configurationName = context.configurationName,
  targetName = 'build',
): string {

  if (!projectName) {
    throw new Error('The projectName is undefined. Ensure the projectName is passed into the executor context.');
  }

  if (!HasProjectTarget(context, projectName, targetName)) {
    console.warn(`Could not find target '${ targetName }' for project '${ projectName }'. Falling back to the project source root.`);
    return GetProjectSourceRoot(context, projectName);
  }

  const target = GetProjectTarget(context, projectName, targetName);

  if (!target) {
    throw new Error(`Could not find target 'build' for project '${ projectName }'`);
  }

  const projectRoot = GetProjectRoot(context, projectName);

  return GuessOutputPath(projectName, projectRoot, target, configurationName);

}

export function GuessOutputPathFromTargetString(
  context: ExecutorContext,
  targetString?: string
) {
  let configurationName: string | undefined = context.configurationName;
  let targetName = 'build';
  let projectName = context.projectName;
  if (targetString) {
    const [ name, target, configuration ] = targetString.split(':');
    if (!name) {
      throw new Error(`Could not extract the project name from the build target '${targetString}'`);
    }
    if (!target) {
      throw new Error(`Could not extract the target name from the build target '${targetString}'`);
    }
    projectName = name;
    targetName = target;
    configurationName = configuration;
  }

  return GuessOutputPathFromContext(context, projectName, configurationName, targetName);
}

interface AngularBuildOutputPath {
  base: string;
}

function isAngularBuildOutputPath(outputPath: any): outputPath is AngularBuildOutputPath {
  return outputPath && typeof outputPath === 'object' && 'base' in outputPath;
}

export function GuessOutputPath(projectName: string, projectRoot: string, buildTarget: TargetConfiguration, configurationName?: string) {

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

  if (!outputPath) {
    throw new Error(`The outputPath is undefined. Ensure the outputPath is passed into the target options.`);
  }

  if (typeof outputPath === 'object') {
    if (isAngularBuildOutputPath(outputPath)) {
      return outputPath.base;
    }
  }

  if (typeof outputPath !== 'string') {
    throw new Error(`The outputPath is not a string. Found: ${ outputPath }`);
  }

  return outputPath
    .replace(/\{projectName}/, projectName)
    .replace(/\{projectRoot}/, projectRoot)
    .replace(/\{workspaceRoot}\//, '');

}
