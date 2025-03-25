import { OpenApiToolNode } from "@rxap/n8n-utilities";
import { INodeProperties } from 'n8n-workflow';
import { join } from "path";

export class GitlabTool extends OpenApiToolNode {

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
