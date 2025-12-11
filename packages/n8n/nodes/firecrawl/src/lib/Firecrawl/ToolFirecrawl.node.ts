import KeyvPostgres from '@keyv/postgres';
import FireCrawlApp from '@mendable/firecrawl-js';
import { cached } from '@rxap/n8n-utilities';
import Keyv from 'keyv';
import type {
  IDataObject,
  INodeType,
  INodeTypeDescription,
  ISupplyDataFunctions,
} from 'n8n-workflow';
import {
  NodeConnectionType,
  NodeOperationError,
} from 'n8n-workflow';
import type { ZodSchema } from 'zod';
import { N8nTool } from '../utils/N8nTool';
import { getConnectionHintNoticeField } from '../utils/sharedFields';
import {
  PlaceholderDefinition,
  ToolParameter,
} from '../utils/interfaces';
import {
  extractParametersFromText,
  makeToolInputSchema,
} from '../utils/utils';
import { clone } from '@rxap/utilities';


export class ToolFirecrawl implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Firecrawl Tool',
    name: 'toolFirecrawl',
    icon: 'file:Firecrawl.svg',
    group: ['output'],
    version: 1,
    description: 'Makes a web scraping request using Firecrawl and returns the scraped data',
    subtitle: '={{ $parameter.toolDescription }}',
    defaults: {
      name: 'Firecrawl Tool',
    },
    credentials: [
      {
        name: 'firecrawl',
        required: true,
      },
      {
        name: 'postgres',
        required: true,
        displayOptions: {
          show: {
            cache: ['postgres'],
          },
        },
      },
    ],
    codex: {
      categories: ['AI'],
      subcategories: {
        AI: ['Tools'],
        Tools: ['Web Scraping'],
      },
    },
    inputs: [],
    outputs: [NodeConnectionType.AiTool],
    outputNames: ['Tool'],
    properties: [
      getConnectionHintNoticeField([NodeConnectionType.AiAgent]),
      {
        displayName: 'Description',
        name: 'toolDescription',
        type: 'string',
        description: 'Explain to LLM what this tool does',
        default: 'Scrapes content from a given URL using Firecrawl',
        typeOptions: {
          rows: 3,
        },
      },
      {
        name: 'operation',
        displayName: 'Operation',
        default: 'scrapeUrl',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Scrape Url',
            value: 'scrapeUrl',
          },
        ],
        required: true,
      },
      {
        displayName: 'URL',
        name: 'url',
        type: 'string',
        default: '{url}',
        required: true,
        description: 'The URL to scrape content from',
      },
      {
        displayName: 'Formats',
        name: 'formats',
        type: 'multiOptions',
        options: [
          {
            value: 'markdown',
            name: 'Markdown',
          },
          {
            value: 'html',
            name: 'HTML',
          },
          {
            value: 'rawHtml',
            name: 'Raw HTML',
          },
          {
            value: 'content',
            name: 'Content',
          },
          {
            value: 'links',
            name: 'Links',
          },
          {
            value: 'screenshot',
            name: 'Screenshot',
          },
          {
            value: 'screenshot@fullPage',
            name: 'Screenshot Full Page',
          },
          {
            value: 'extract',
            name: 'Extract',
          },
          {
            value: 'json',
            name: 'JSON',
          },
        ],
        default: ['markdown'],
      },
      {
        displayName: 'Only Main Content',
        name: 'onlyMainContent',
        type: 'boolean',
        default: true,
        description: 'Whether to return only the main content excluding headers, navs, footers, etc',
      },
      {
        displayName: 'Include Tags',
        name: 'includeTags',
        type: 'string',
        default: '',
        description: 'Tags, classes and ids to include in the output (comma-separated)',
        typeOptions: {
          multipleValues: true,
        },
      },
      {
        displayName: 'Exclude Tags',
        name: 'excludeTags',
        type: 'string',
        default: '',
        description: 'Tags, classes and ids to exclude from the output (comma-separated)',
        typeOptions: {
          multipleValues: true,
        },
      },

      {
        name: 'prompt',
        displayName: 'Prompt',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: {
            operation: [ 'extract' ],
          },
        },
      },
      {
        name: 'schema',
        displayName: 'Schema',
        type: 'json',
        required: true,
        default: '',
        displayOptions: {
          show: {
            operation: [ 'extract' ],
          },
        },
      },
      {
        name: 'systemPrompt',
        displayName: 'System Prompt',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: {
            operation: [ 'extract' ],
          },
        },
      },
      {
        name: 'showSources',
        displayName: 'Show Sources',
        type: 'boolean',
        default: false,
        displayOptions: {
          show: {
            operation: [ 'extract' ],
          },
        },
      },
      {
        name: 'enableWebSearch',
        displayName: 'Enable Web Search',
        type: 'boolean',
        default: false,
        displayOptions: {
          show: {
            operation: [ 'extract' ],
          },
        },
      },

      {
        displayName: 'Cache',
        name: 'cache',
        type: 'options',
        options: [
          {
            name: 'None',
            value: 'none',
          },
          {
            name: 'Postgres',
            value: 'postgres',
          },
        ],
        default: 'postgres',
        description: 'Whether to use caching to speed up scraping',
      },
      {
        name: 'cacheTTL',
        displayName: 'Cache TTL',
        default: -1,
        type: 'number',
        noDataExpression: true,
        displayOptions: {
          show: {
            cache: ['postgres']
          }
        }
      },
      {
        displayName: 'Placeholder Definitions',
        name: 'placeholderDefinitions',
        type: 'fixedCollection',
        default: {
          values: [
            {
              name: 'url',
              description: 'The URL to scrape content from',
              type: 'string',
            },
          ],
        },
        typeOptions: {
          multipleValues: true,
        },
        options: [
          {
            name: 'values',
            displayName: 'Values',
            values: [
              {
                displayName: 'Placeholder Name',
                name: 'name',
                type: 'string',
                default: '',
              },
              {
                displayName: 'Description',
                name: 'description',
                type: 'string',
                default: '',
              },
              {
                displayName: 'Type',
                name: 'type',
                type: 'options',
                options: [
                  {
                    name: 'String',
                    value: 'string',
                  },
                  {
                    name: 'URL',
                    value: 'url',
                  },
                ],
                default: 'string',
              },
            ],
          },
        ],
      },
    ],
  };

  async supplyData(this: ISupplyDataFunctions, itemIndex: number) {
    const operation = this.getNodeParameter('operation', 0, 'scrapeUrl') as 'scrapeUrl' | string;
    const cache = this.getNodeParameter('cache', 0, 'none') as 'none' | 'postgres';
    const cacheTTL = this.getNodeParameter('cacheTTL', 0, -1) as number;

    const toolDescription = this.getNodeParameter('toolDescription', itemIndex) as string;

    const url = this.getNodeParameter('url', itemIndex) as string;

    // Configure the Firecrawl client
    const {apiKey} = await this.getCredentials<{ apiKey: string }>('firecrawl');
    const firecrawl = new FireCrawlApp({apiKey});

    // Configure caching if enabled
    let keyv: Keyv | undefined = undefined;
    switch (cache) {
      case 'postgres':
        // eslint-disable-next-line no-case-declarations
        const {
          host,
          database,
          user,
          password,
          ssl,
          port
        } = await this.getCredentials<{ host: string, database: string, user: string, password: string, ssl: 'allow' | 'disable' | 'require', port: number  }>('postgres');
        keyv = new Keyv(
          new KeyvPostgres({
            uri: `postgres://${user}:${password}@${host}:${port}/${database}?sslmode=${ssl}`,
            useUnloggedTable: true
          })
        );
        break;
    }

    const scrapeUrl = async <T extends ZodSchema>(url: string, options: any): Promise<Record<any, any>> => {
      const scrapeResult = await firecrawl.v1.scrapeUrl(url, options);
      if (scrapeResult.success) {
        return scrapeResult as Record<any, any>;
      }
      throw new NodeOperationError(this.getNode(), `The operation "scrapeUrl" failed: ${scrapeResult.error}`);
    };

    const extract = async <T extends ZodSchema>(url: string, options: any): Promise<Record<any, any>> => {
      const extractResult = await firecrawl.v1.extract([ url ], options);
      if (extractResult.success) {
        return extractResult as Record<any, any>;
      }
      throw new NodeOperationError(this.getNode(), `The operation "extract" failed: ${ extractResult.error }`);
    };

    // Extract placeholder definitions
    const placeholdersDefinitions = (
      this.getNodeParameter(
        'placeholderDefinitions.values',
        itemIndex,
        [],
      ) as PlaceholderDefinition[]
    ).map((p) => {
      if (p.name.startsWith('{') && p.name.endsWith('}')) {
        p.name = p.name.slice(1, -1);
      }
      return p;
    });

    const toolParameters: ToolParameter[] = [];

    toolParameters.push(
      ...extractParametersFromText(placeholdersDefinitions, url, 'path'),
    );

    for (const placeholder of placeholdersDefinitions) {
      if (!toolParameters.find((parameter) => parameter.name === placeholder.name)) {
        throw new NodeOperationError(
          this.getNode(),
          `Misconfigured placeholder '${placeholder.name}'`,
          {
            itemIndex,
            description:
              "This placeholder is defined in the 'Placeholder Definitions' but isn't used anywhere. Either remove the definition, or add the placeholder to a part of the request.",
          },
        );
      }
    }

    // Create the tool function
    const toolFunction = async (query: string | IDataObject): Promise<string> => {

      const { index } = this.addInputData(NodeConnectionType.AiTool, [[{ json: { query } }]]);


      const formats = this.getNodeParameter('formats', index, ['markdown']) as any;
      const onlyMainContent = this.getNodeParameter('onlyMainContent', index, true) as boolean;
      const includeTags = clone(this.getNodeParameter('includeTags', index, null) as string[] | null ?? []);
      const excludeTags = clone(this.getNodeParameter('excludeTags', index, null) as string[] | null ?? []);
      const prompt = this.getNodeParameter('prompt', index, null) as string | null;
      const rawSchema = this.getNodeParameter('schema', index, null) as object | string | null;
      const systemPrompt = this.getNodeParameter('systemPrompt', index, null) as string | null;
      const enableWebSearch = this.getNodeParameter('enableWebSearch', index, undefined) as boolean | undefined;
      const showSources = this.getNodeParameter('showSources', index, undefined) as boolean | undefined;
      const schema = rawSchema ? typeof rawSchema === 'string' ? JSON.parse(rawSchema) : rawSchema : null;

      this.logger.debug(`Received query: ${JSON.stringify(query)}`);

      const params = typeof query === 'string' ? JSON.parse(query) : query;

      let finalUrl = url;

      for (const [key, value] of Object.entries(params)) {
        if (finalUrl.includes(`{${key}}`)) {
          finalUrl = finalUrl.replace(`{${key}}`, value + '');
        }
        for (let i = 0; i < includeTags.length; i++){
          const tag = includeTags[i];
          if (tag.includes(`{${key}}`)) {
            includeTags[i] = tag.replace(`{${key}}`, value + '');
          }
        }
        for (let i = 0; i < excludeTags.length; i++){
          const tag = excludeTags[i];
          if (tag.includes(`{${key}}`)) {
            excludeTags[i] = tag.replace(`{${key}}`, value + '');
          }
        }
      }

      switch (operation) {

        case 'scrapeUrl':
          return JSON.stringify(await cached({ keyv, ttl: cacheTTL > 0 ? cacheTTL : undefined }, scrapeUrl, finalUrl, {
            formats: formats,
            onlyMainContent,
            includeTags: includeTags?.length ? includeTags : undefined,
            excludeTags: excludeTags?.length ? excludeTags : undefined,
          }), undefined, 2);

        case 'extract':
          return JSON.stringify(await cached({
              keyv,
              ttl: cacheTTL > 0 ? cacheTTL : undefined,
            }, extract, url, {
              prompt,
              schema,
              systemPrompt,
              enableWebSearch,
              showSources,
            }), undefined, 2);
      }

      throw new NodeOperationError(
        this.getNode(),
        `The operation "${operation}" is not implemented.`,
      );

    };

    // Create the N8nTool instance
    const tool = new N8nTool(this, {
      name: 'firecrawl',
      description: toolDescription,
      schema: makeToolInputSchema(toolParameters),
      func: toolFunction,
    });

    return {
      response: tool,
    };
  }

}
