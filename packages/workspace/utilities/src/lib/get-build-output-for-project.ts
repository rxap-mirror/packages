import { ProjectConfiguration } from '@nx/devkit';

/**
 * Retrieves the cleaned build output path for a given project configuration.
 *
 * This function examines the 'build' target of a project configuration to determine the output path.
 * It ensures that the project has a defined 'build' target and that this target specifies at least one output path.
 * The function processes the output path to replace placeholders with actual project-specific values and ensures
 * the path does not start with a forward slash, which would indicate an absolute path.
 *
 * @param {ProjectConfiguration} project - The project configuration object, which should include at least the 'name',
 * 'root', and 'targets' properties. The 'targets' property should include a 'build' target with an 'outputs' array and
 * optionally 'options' for dynamic path resolution.
 *
 * @returns {string} The processed and validated build output path, with placeholders substituted and leading slashes removed.
 *
 * @throws {Error} Throws an error if the project does not have a 'build' target, if the 'build' target does not specify
 * any outputs, if the outputs are invalid, or if the final output path is absolute.
 */
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
