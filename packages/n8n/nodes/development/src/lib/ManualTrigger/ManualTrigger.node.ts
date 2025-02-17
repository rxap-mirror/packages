import type {
  INodeType,
  INodeTypeDescription,
  ITriggerFunctions,
  ITriggerResponse,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';

export class ManualTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Manual Trigger',
    name: 'developmentManualTrigger',
    icon: 'fa:play',
    group: ['trigger'],
    version: 1,
    description: 'Runs the flow on clicking a button in n8n with the specified input data',
    eventTriggerDescription: '',
    maxNodes: 1,
    defaults: {
      name: 'When clicking ‘Test workflow’',
      color: '#909298',
    },
    inputs: [],
    outputs: [NodeConnectionType.Main],
    properties: [
      {
        name: 'input',
        displayName: 'Input',
        description: 'The input data send on manual trigger',
        type: 'json',
        default: '',
        required: false,
      }
    ],
  };

  async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
    const manualTriggerFunction = async () => {
      this.emit([this.helpers.returnJsonArray([JSON.parse(this.getNodeParameter('input') as string)])]);
    };

    return {
      manualTriggerFunction,
    };
  }
}
