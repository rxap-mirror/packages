import { HttpBearerAuth } from '@rxap/n8n-utilities';
import type { ICredentialTestRequest } from 'n8n-workflow';

export class GitlabAuth extends HttpBearerAuth {
  override name = 'gitlabAuth';
  override displayName = 'Gitlab Auth';

  constructor() {
    super();
    this.properties.push({
      displayName: 'Gitlab API URL',
      name: 'baseUrl',
      type: 'string',
      default: 'https://gitlab.com',
      hint: 'The url of the gitlab instance without the /api/v4/ suffix.'
    });
  }

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.baseUrl}}',
      url: '/api/v4/projects',
    },
  };

}
