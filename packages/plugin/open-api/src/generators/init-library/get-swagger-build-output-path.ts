import { Tree } from '@nx/devkit';
import {
  GetBuildOutputForProject,
  GetProject,
  GetTarget,
  GetTargetOptions,
  HasProject,
  HasTarget,
} from '@rxap/workspace-utilities';

export function getSwaggerBuildOutputPath(tree: Tree, apiProjectName: string, projectName: string): string {

  if (!HasProject(tree, apiProjectName)) {
    throw new Error(
      `The api project '${ apiProjectName }' for the open api client sdk library '${ projectName }' does not exists!`);
  }
  const apiProject = GetProject(tree, apiProjectName);

  if (HasTarget(tree, apiProjectName, 'swagger-build')) {
    const swaggerBuild = GetTarget(apiProject, 'swagger-build');
    const { outputPath } = GetTargetOptions(swaggerBuild);
    return outputPath as string;
  } else if (HasTarget(tree, apiProjectName, 'build')) {
    return GetBuildOutputForProject(apiProject).replace('dist/', 'swagger/');
  } else {
    throw new Error(`The api project '${ apiProjectName }' does not have a 'swagger-build' or 'build' target!`);
  }

}
