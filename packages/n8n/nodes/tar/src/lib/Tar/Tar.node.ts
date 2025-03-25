import { INodeType, INodeTypeDescription, NodeConnectionType } from 'n8n-workflow';

export class Tar implements INodeType {
  description: INodeTypeDescription = {
      version: 1,
      description: '',
      defaults: { name: 'Tar' },
      name: 'Tar',
      inputs: [ NodeConnectionType.Main ],
      outputs: [ NodeConnectionType.Main ],
      displayName: 'Tar',
      group: ['transform'],
      icon: 'file:Tar.svg',
      properties: []
    };
}
