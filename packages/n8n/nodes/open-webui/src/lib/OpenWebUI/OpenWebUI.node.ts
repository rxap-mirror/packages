import { OpenApiNode } from '@rxap/n8n-utilities';
import { INodeType } from 'n8n-workflow';
import { join } from 'path';

export class OpenWebUI extends OpenApiNode implements INodeType {
  constructor() {
    super(
      join(__dirname, 'openapi.json'),
      {
        name: 'OpenWebUI',
        displayName: 'Open Web UI',
      }
    );
    // console.log('props', JSON.stringify(this.description.properties));
    // console.log('schema', JSON.stringify(this.openapi));
  }
}
