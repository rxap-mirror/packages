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
            name: 'gitlabApi',
            required: true,
          },
        ],
      },
    );
  }

  override buildBaseUrlParameters() {
    // no-op
    // the base url is defined in the gitlabApi credential
    return [{ name: 'baseUrl', type: 'string', default: 'https://gitlab.com' }] as INodeProperties[];
  }

}
