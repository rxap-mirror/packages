import { INodeType, INodeTypeDescription, NodeConnectionType } from 'n8n-workflow';

export class SanitizeHtml implements INodeType {
  description: INodeTypeDescription = {
      version: 1,
      description: 'Sanitize HTML content based on specified rules',
      defaults: { name: 'SanitizeHtml' },
      name: 'rxapSanitizeHtml',
      inputs: [ NodeConnectionType.Main ],
      outputs: [ NodeConnectionType.Main ],
      displayName: 'SanitizeHtml',
      group: ['transform'],
      icon: 'file:SanitizeHtml.svg',
      properties: []
    };
}
