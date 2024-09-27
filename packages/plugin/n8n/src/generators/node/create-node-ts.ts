import { Tree } from '@nx/devkit';
import {
  CoerceClass,
  CoerceImports,
} from '@rxap/ts-morph';
import { classify } from '@rxap/utilities';
import { TsMorphProjectTransform } from '@rxap/workspace-ts-morph';
import { join } from 'path';
import { Writers } from 'ts-morph';

export function createNodeTs(tree: Tree, projectName: string, nodeName: string, nodeNamePrefix: string, description: string) {

  TsMorphProjectTransform(tree, {
    project: projectName,
  }, (_, sourceFile) => {

    CoerceClass(sourceFile, classify(nodeName), {
      isExported: true,
      implements: [ 'INodeType' ],
      properties: [{
        name: 'description',
        type: 'INodeTypeDescription',
        initializer: Writers.object({
          version: '1',
          description: w => w.quote(description),
          defaults: `{ name: '${classify(nodeName)}' }`,
          name: w => w.quote(`${nodeNamePrefix}${classify(nodeName)}`),
          inputs: '[ NodeConnectionType.Main ]',
          outputs: '[ NodeConnectionType.Main ]',
          displayName: w => w.quote(classify(nodeName)),
          group: `['transform']`,
          icon: w => w.quote(`file:${classify(nodeName)}.svg`),
          properties: '[]',
        })
      }]
    });

    CoerceImports(sourceFile, [
      {
        namedImports: [ 'INodeType', 'INodeTypeDescription', 'NodeConnectionType' ],
        moduleSpecifier: 'n8n-workflow',
      }
    ]);

  }, join('src', 'lib', classify(nodeName), `${classify(nodeName)}.node.ts?`));

}
