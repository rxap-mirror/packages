import { OpenApiNode } from '@rxap/n8n-utilities';
import {
  INodeProperties,
  INodeType,
} from 'n8n-workflow';
import { join } from 'path';

export class OpenWebUI extends OpenApiNode implements INodeType {
  constructor() {
    super(
      join(__dirname, 'openapi.json'),
      {
        name: 'OpenWebUI',
        displayName: 'Open Web UI',
        credentials: [
          {
            name: 'openWebUIAuth',
            displayName: 'Open WebUI Auth',
            required: true,
          },
        ],
      }
    );
    // console.log('props', JSON.stringify(this.description.properties));
    // console.log('schema', JSON.stringify(this.openapi));
  }

  override buildBaseUrlParameters() {
    // no-op
    // the base url is defined in the openWebUIAuth credential
    return [{ name: 'baseUrl', type: 'hidden', default: 'http://open-webui:8080' }] as INodeProperties[];
  }

}
