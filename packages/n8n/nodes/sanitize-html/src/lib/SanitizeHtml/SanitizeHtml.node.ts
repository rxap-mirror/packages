import { CaptureExecutionError } from '@rxap/n8n-utilities';
import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  NodeConnectionType,
  NodeExecutionWithMetadata,
} from 'n8n-workflow';
import { INodeTypeDescription } from 'n8n-workflow/dist/Interfaces';
import sanitizeHtml, { AllowedAttribute } from 'sanitize-html';

function getAllowedTags(this: IExecuteFunctions, index: number): string[] {
  const allowedTagsParameter = this.getNodeParameter('allowedTags', index, {}) as { add?: string[], remove?: string[], only?: string[] };
  let allowedTags: string[] = [...sanitizeHtml.defaults.allowedTags];
  const addAllowedTags = (allowedTagsParameter.add ?? []).filter(Boolean);
  const removeAllowedTags = (allowedTagsParameter.remove ?? []).filter(Boolean);
  const onlyAllowedTags = (allowedTagsParameter.only ?? []).filter(Boolean);
  if (onlyAllowedTags.length) {
    allowedTags = onlyAllowedTags;
  } else {
    if (allowedTagsParameter.add?.length) {
      allowedTags = allowedTags.concat(addAllowedTags);
    }
    if (removeAllowedTags.length) {
      allowedTags = allowedTags.filter(tag => !removeAllowedTags.includes(tag));
    }
  }
  return allowedTags;
}

function getAllowedAttributes(this: IExecuteFunctions, index: number): Record<string, AllowedAttribute[]> {
  const { allowed = [] } = this.getNodeParameter('allowedAttributes', index, { allowed: [] }) as { allowed: Array<{ tag: string, attributes: string[] }> };
  const allowedAttributes: Record<string, AllowedAttribute[]> = {};
  for (const [tag, attrs] of Object.entries(sanitizeHtml.defaults.allowedAttributes)) {
    allowedAttributes[tag] = [...attrs];
  }
  for (const { tag, attributes } of allowed) {
    allowedAttributes[tag] = attributes.filter(Boolean);
  }
  return allowedAttributes;
}

export class SanitizeHtml implements INodeType {

  description: INodeTypeDescription = {
    version: 1,
    name: 'sanitizeHtml',
    displayName: 'Sanitize HTML',
    group: ['transform'],
    defaults: {
      name: 'Sanitize HTML',
    },
    description: 'Sanitize HTML content based on specified rules',
    inputs: [ NodeConnectionType.Main ],
    outputs: [ NodeConnectionType.Main ],
    icon: { light: 'file:SanitizeHtml.svg', dark: 'file:SanitizeHtml.dark.svg' },
    properties: [
      {
        name: 'html',
        displayName: 'HTML',
        description: 'HTML content to sanitize',
        required: true,
        default: '',
        type: 'string',
      },
      {
        name: 'allowedAttributes',
        displayName: 'Allowed Attributes',
        description: 'Define which HTML attributes are allowed',
        required: false,
        default: [],
        type: 'fixedCollection',
        typeOptions: {
          multipleValues: true,
        },
        options: [
          {
            name: 'allowed',
            displayName: 'Allowed Attributes',
            values: [
              {
                name: 'tag',
                displayName: 'Tag',
                description: 'The HTML tag',
                type: 'string',
                default: '',
                required: true,
              },
              {
                name: 'attributes',
                displayName: 'Attributes',
                description: 'The HTML attributes',
                type: 'string',
                default: [],
                required: true,
                typeOptions: {
                  multipleValues: true,
                },
              }
            ],
          }
        ]
      },
      {
        name: 'allowedTags',
        displayName: 'Allowed Tags',
        description: 'Define which HTML tags are allowed',
        required: false,
        default: [],
        type: 'collection',
        options: [
          {
            name: 'add',
            displayName: 'Add to default list',
            description: 'The HTML tags to add to the default list',
            type: 'string',
            default: [],
            required: true,
            typeOptions: {
              multipleValues: true,
            },
          },
          {
            name: 'remove',
            displayName: 'Remove from default list',
            description: 'The HTML tags to remove from the default list',
            type: 'string',
            default: [],
            required: true,
            typeOptions: {
              multipleValues: true,
            },
          },
          {
            name: 'only',
            displayName: 'Only allow',
            description: 'The HTML tags to only allow',
            type: 'string',
            default: [],
            required: true,
            typeOptions: {
              multipleValues: true,
            },
          }
        ]
      }
    ]
  };

  @CaptureExecutionError()
  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][] | NodeExecutionWithMetadata[][] | null> {
    const items = this.getInputData();

    const results: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++){
      const html = this.getNodeParameter('html', i) as string;

      const allowedTags = getAllowedTags.call(this, i);
      const allowedAttributes = getAllowedAttributes.call(this, i);

      const options: sanitizeHtml.IOptions = {
        allowedTags,
        allowedAttributes,
      };

      const clean = sanitizeHtml(html, options);

      results[i] = { json: { html: clean } };
    }

    return [results];
  }

}
