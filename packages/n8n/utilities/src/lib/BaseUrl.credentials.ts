import type {
  Icon,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class BaseUrl implements ICredentialType {
  name = 'baseUrl';

  displayName = 'Base URL';

  genericAuth = true;

  icon: Icon = 'node:n8n-nodes-base.httpRequest';

  properties: INodeProperties[] = [
    {
      displayName: 'Base URL',
      name: 'baseUrl',
      type: 'string',
      default: '',
    }
  ];

}
