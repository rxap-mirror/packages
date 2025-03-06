import { HttpBearerAuth } from '@rxap/n8n-utilities';
import type { ICredentialTestRequest } from 'n8n-workflow';

export class OpenWebUIAuth extends HttpBearerAuth {
  override name = 'openWebUIAuth';
  override displayName = 'Open WebUI Auth';

  constructor() {
    super();
    this.properties.push({
      displayName: 'Open WebUI API URL',
      name: 'baseUrl',
      type: 'string',
      default: 'http://open-webui:8080'
    });
  }

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.baseUrl}}',
      url: '/api/v1/models/',
    },
  };
}
