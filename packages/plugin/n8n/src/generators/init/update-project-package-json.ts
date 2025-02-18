import { Tree } from '@nx/devkit';
import { CoerceArrayItems } from '@rxap/utilities';
import {
  GetRootPackageJson,
  UpdateProjectPackageJson,
} from '@rxap/workspace-utilities';

export function updateProjectPackageJson(tree: Tree, projectName: string) {

  UpdateProjectPackageJson(tree, packageJson => {
    packageJson.n8n ??= {};
    packageJson.n8n.n8nNodesApiVersion ??= 1;
    packageJson.n8n.nodes ??= [];
    packageJson.n8n.credentials ??= [];
    packageJson.keywords ??= [];
    CoerceArrayItems(packageJson.keywords, ['n8n-community-node-package']);

    const rootPackageJson = GetRootPackageJson(tree);
    const n8nWorkflowVersion = rootPackageJson.dependencies?.['n8n-workflow'];
    if (n8nWorkflowVersion) {
      packageJson.peerDependencies ??= {};
      packageJson.peerDependencies['n8n-workflow'] ??= n8nWorkflowVersion;
    }
  }, { projectName });

}
