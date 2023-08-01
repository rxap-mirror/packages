import { ProjectConfiguration } from '@nx/devkit';

export function GetBuildOutputForProject(project: ProjectConfiguration) {
  project.targets ??= {};
  if (!project.targets['build']) {
    throw new Error(`The project ${ project.name } has no build target. Can not determine the build output path.`);
  }
  const outputs = project.targets['build'].outputs;
  if (!outputs || !outputs.length) {
    throw new Error(`The project ${ project.name } has no build outputs. Can not determine the build output path.`);
  }
  const [ output ] = outputs;
  const cleanOutput = output
    .replace('{workspaceRoot}', '')
    .replace('{projectRoot}', project.root)
    .replace(/\{options\.(.+)}/, (_, option) => project.targets!['build'].options[option])
    .replace(/^\//, '');

  if (!cleanOutput) {
    throw new Error(`The project ${ project.name } has an invalid build output path. Can not determine the build output path.`);
  }

  if (cleanOutput.startsWith('/')) {
    throw new Error(`The project ${ project.name } has an absolute build output path. Can not determine the build output path.`);
  }

  return cleanOutput;
}
