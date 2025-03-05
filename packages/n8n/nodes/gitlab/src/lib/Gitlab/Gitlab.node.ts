import { OpenApiNode } from '@rxap/n8n-utilities';
import {
  INodeProperties,
  INodeType,
} from 'n8n-workflow';
import { join } from 'path';

export class Gitlab extends OpenApiNode implements INodeType {
  constructor() {
    super(
      join(__dirname, 'openapi.json'),
      {
        name: 'Gitlab',
        displayName: 'GitLab API',
        credentials: [
          {
            name: 'gitlabAuth',
            required: true,
          },
        ],
      },
    );
  }

  override buildBaseUrlParameters() {
    // no-op
    // the base url is defined in the gitlabAuth credential
    return [{ name: 'baseUrl', type: 'hidden', default: 'https://gitlab.com' }] as INodeProperties[];
  }

}
