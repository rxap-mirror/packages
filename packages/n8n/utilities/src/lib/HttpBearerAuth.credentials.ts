import type {
  IAuthenticateGeneric,
  Icon,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class HttpBearerAuth implements ICredentialType {
  name = 'httpBearerAuth';

  displayName = 'Bearer Auth';

  genericAuth = true;

  icon: Icon = 'node:n8n-nodes-base.httpRequest';

  properties: INodeProperties[] = [
    {
      displayName: 'Access Token',
      name: 'accessToken',
      type: 'string',
      typeOptions: { password: true },
      default: '',
    }
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        Authorization: '=Bearer {{$credentials.accessToken}}',
      },
    },
  };
}
