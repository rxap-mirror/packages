import { Tree } from '@nx/devkit';
import {
  CoerceClass,
  CoerceImports,
} from '@rxap/ts-morph';
import { classify } from '@rxap/utilities';
import { TsMorphProjectTransform } from '@rxap/workspace-ts-morph';
import { join } from 'path';
import { Writers } from 'ts-morph';

export function createTriggerTs(tree: Tree, projectName: string, triggerName: string, namePrefix: string, description: string) {

  return TsMorphProjectTransform(tree, {
    project: projectName,
  }, (_, sourceFile) => {

    CoerceClass(sourceFile, classify(triggerName) + 'Trigger', {
      isExported: true,
      implements: [ 'INodeType' ],
      properties: [{
        name: 'description',
        type: 'INodeTypeDescription',
        initializer: Writers.object({
          version: '1',
          description: w => w.quote(description),
          defaults: `{ name: '${classify(triggerName)}Trigger' }`,
          name: w => w.quote(`${namePrefix}${classify(triggerName)}Trigger`),
          inputs: '[]',
          triggerPanel: w => Writers.object({
            header: w => w.quote(''),
            executionsHelp: w => Writers.object({
              inactive: w => w.quote(`<b>While building your workflow</b>, click the 'listen' button, then trigger a Rabbit MQ event. This will trigger an execution, which will show up in this editor.<br /> <br /><b>Once you're happy with your workflow</b>, <a data-key='activate'>activate</a> it. Then every time a change is detected, the workflow will execute. These executions will show up in the <a data-key='executions'>executions list</a>, but not in the editor.`),
              active: w => w.quote(`<b>While building your workflow</b>, click the 'listen' button, then trigger a Rabbit MQ event. This will trigger an execution, which will show up in this editor.<br /> <br /><b>Your workflow will also execute automatically</b>, since it's activated. Every time a change is detected, this node will trigger an execution. These executions will show up in the <a data-key='executions'>executions list</a>, but not in the editor.`)
            })(w),
            activationHint: w => w.quote('Once you’ve finished building your workflow, <a data-key=\'activate\'>activate</a> it to have it also listen continuously (you just won’t see those executions here).')
          })(w),
          outputs: '[ NodeConnectionType.Main ]',
          displayName: w => w.quote(classify(triggerName) + 'Trigger'),
          group: `['trigger']`,
          icon: w => w.quote(`file:${classify(triggerName)}.svg`),
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

  }, join('src', 'lib', classify(triggerName), `${classify(triggerName)}Trigger.node.ts?`));

}
