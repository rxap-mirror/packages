import type {
  IAuthenticateGeneric,
  Icon,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class Oauth2ProxyAuth implements ICredentialType {
  name = 'oauth2ProxyAuth';

  displayName = 'Oauth2 Proxy Auth';

  genericAuth = true;

  icon: Icon = 'node:n8n-nodes-base.httpRequest';

  properties: INodeProperties[] = [
    {
      displayName: 'User ID',
      name: 'userId',
      type: 'string',
      default: 'n8n-client',
    },
    {
      displayName: 'Organization ID',
      name: 'organizationId',
      type: 'string',
      default: 'ea5dc87a-9c4a-48d4-8a0a-ccea1474498f',
    }
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        'x-auth-request-user': '={{$credentials.userId}}',
        'x-organization': '={{$credentials.organizationId}}',
      },
    },
  };
}
