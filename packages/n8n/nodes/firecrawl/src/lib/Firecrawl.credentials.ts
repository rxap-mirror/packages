import type {
  IAuthenticateGeneric,
  Icon,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class Firecrawl implements ICredentialType {
  name = 'firecrawl';

  displayName = 'Firecrawl';

  genericAuth = true;

  icon: Icon = 'node:n8n-nodes-base.firecrawl';

  properties: INodeProperties[] = [
    {
      displayName: 'Api Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: { password: true },
      default: '',
    }
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        Authorization: '=Bearer {{$credentials.apiKey}}',
      },
    },
  };

  test = {
    request: {
      url: 'https://api.firecrawl.dev/v1/team/credit-usage'
    }
  };

}
