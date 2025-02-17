import { INodeType, INodeTypeDescription, NodeConnectionType } from 'n8n-workflow';

export class Hash implements INodeType {
  description: INodeTypeDescription = {
      version: 1,
      description: 'Calculate the hash of a file',
      defaults: { name: 'Hash' },
      name: 'fileHash',
      inputs: [ NodeConnectionType.Main ],
      outputs: [ NodeConnectionType.Main ],
      displayName: 'Hash',
      group: ['transform'],
      icon: 'file:Hash.svg',
      properties: []
    };
}
