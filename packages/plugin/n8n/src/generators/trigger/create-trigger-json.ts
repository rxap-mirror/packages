import { Tree } from '@nx/devkit';
import {
  classify,
  dasherize,
} from '@rxap/utilities';
import { GetProjectSourceRoot } from '@rxap/workspace-utilities';
import { join } from 'path';

export function createTriggerJson(tree: Tree, projectName: string, triggerName: string, namePrefix: string) {

  const projectSourceRoot = GetProjectSourceRoot(tree, projectName);

  tree.write(join(projectSourceRoot, 'lib', classify(triggerName), `${classify(triggerName)}Trigger.node.json`), JSON.stringify({
    "node": `n8n-nodes-base.${namePrefix}${classify(triggerName)}Trigger`,
    "nodeVersion": "1.0",
    "codexVersion": "1.0",
    "categories": ["Data & Storage"],
    "resources": {
      "credentialDocumentation": [],
      "primaryDocumentation": []
    },
    "alias": [classify(triggerName), ...dasherize(triggerName).split('-')],
  }, undefined, 2));

}
