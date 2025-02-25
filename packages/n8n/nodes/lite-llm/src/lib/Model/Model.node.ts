import { INodeType, INodeTypeDescription, NodeConnectionType } from 'n8n-workflow';

export class Model implements INodeType {
  description: INodeTypeDescription = {
      version: 1,
      description: 'For advanced usage with an AI chain',
      defaults: { name: 'Model' },
      name: 'liteLLMModel',
      inputs: [ NodeConnectionType.Main ],
      outputs: [ NodeConnectionType.Main ],
      displayName: 'Model',
      group: ['transform'],
      icon: 'file:Model.svg',
      properties: []
    };
}
