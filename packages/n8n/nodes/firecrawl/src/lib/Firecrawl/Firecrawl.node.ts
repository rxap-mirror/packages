import { INodeType, INodeTypeDescription, NodeConnectionType } from 'n8n-workflow';

export class Firecrawl implements INodeType {
  description: INodeTypeDescription = {
      version: 1,
      description: 'Interactive with the firecrawl api',
      defaults: { name: 'Firecrawl' },
      name: 'rxapFirecrawl',
      inputs: [ NodeConnectionType.Main ],
      outputs: [ NodeConnectionType.Main ],
      displayName: 'Firecrawl',
      group: ['transform'],
      icon: 'file:Firecrawl.svg',
      properties: []
    };
}
