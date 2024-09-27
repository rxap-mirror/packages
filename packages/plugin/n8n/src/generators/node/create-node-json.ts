import { Tree } from '@nx/devkit';
import {
  classify,
  dasherize,
} from '@rxap/utilities';
import { GetProjectSourceRoot } from '@rxap/workspace-utilities';
import { join } from 'path';

export function createNodeJson(tree: Tree, projectName: string, nodeName: string, nodeNamePrefix: string) {

  const projectSourceRoot = GetProjectSourceRoot(tree, projectName);

  tree.write(join(projectSourceRoot, 'lib', classify(nodeName), `${classify(nodeName)}.node.json`), JSON.stringify({
    "node": `n8n-nodes-base.${nodeNamePrefix}${classify(nodeName)}`,
    "nodeVersion": "1.0",
    "codexVersion": "1.0",
    "categories": ["Data & Storage"],
    "resources": {
      "credentialDocumentation": [],
      "primaryDocumentation": []
    },
    "alias": [classify(nodeName), ...dasherize(nodeName).split('-')],
  }, undefined, 2));

}
