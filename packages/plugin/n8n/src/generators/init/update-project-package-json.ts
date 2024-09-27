import { Tree } from '@nx/devkit';
import { UpdateProjectPackageJson } from '@rxap/workspace-utilities';

export function updateProjectPackageJson(tree: Tree, projectName: string) {

  UpdateProjectPackageJson(tree, packageJson => {
    packageJson.n8n ??= {};
    packageJson.n8n.n8nNodesApiVersion ??= 1;
    packageJson.n8n.nodes ??= [];
    packageJson.n8n.credentials ??= [];
  }, { projectName });

}
