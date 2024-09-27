import { Tree } from '@nx/devkit';
import {
  classify,
  CoerceArrayItems,
} from '@rxap/utilities';
import { UpdateProjectPackageJson } from '@rxap/workspace-utilities';

export function updatePackageJson(tree: Tree, projectName: string, nodeName: string) {
  UpdateProjectPackageJson(tree, packageJson => {
    packageJson.n8n ??= {};
    packageJson.n8n.nodes ??= [];
    CoerceArrayItems(packageJson.n8n.nodes, [ `src/lib/${classify(nodeName)}/${classify(nodeName)}.node.js` ]);
  }, { projectName });
}
