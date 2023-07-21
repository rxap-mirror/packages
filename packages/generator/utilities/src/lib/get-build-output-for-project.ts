import { ProjectConfiguration } from '@nx/devkit';

export function GetBuildOutputForProject(project: ProjectConfiguration, workspaceRoot: string) {
  project.targets ??= {};
  if (!project.targets['build']) {
    throw new Error(`The project ${ project.name } has no build target. Can not determine the build output path.`);
  }
  const outputs = project.targets['build'].outputs;
  if (!outputs || !outputs.length) {
    throw new Error(`The project ${ project.name } has no build outputs. Can not determine the build output path.`);
  }
  const [ output ] = outputs;
  return output
    .replace('{workspaceRoot}', workspaceRoot)
    .replace('{projectRoot}', project.root)
    .replace(/\{options\.(.+)}/, (_, option) => project.targets!['build'].options[option]);
}
