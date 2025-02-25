import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class LiteLLM implements ICredentialType {
  name = 'litellm';

  displayName = 'LiteLLM';

  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: { password: true },
      required: true,
      default: '',
    },
    {
      displayName: 'BaseURL',
      name: 'baseURL',
      type: 'string',
      default: 'https://api.openai.com',
      description: "The LiteLLM Proxy base url",
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        Authorization: '=Bearer {{$credentials.apiKey}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.baseURL}}',
      url: '/v1/models',
    },
  };
}
