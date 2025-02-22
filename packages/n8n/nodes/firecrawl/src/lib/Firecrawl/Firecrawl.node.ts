import KeyvPostgres from '@keyv/postgres';
import FireCrawlApp from '@mendable/firecrawl-js';
import {
  CrawlScrapeOptions,
  ScrapeParams,
} from '@mendable/firecrawl-js/src';
import {
  cached,
  CaptureExecutionError,
  forEachItem,
} from '@rxap/n8n-utilities';
import Keyv from 'keyv';
import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeConnectionType,
  NodeOperationError,
} from 'n8n-workflow';
import { INodeProperties } from 'n8n-workflow/dist/Interfaces';
import type { ZodSchema } from 'zod';

export class Firecrawl implements INodeType {
  description: INodeTypeDescription = {
    version: 1,
    description: 'Interactive with the firecrawl api',
    defaults: { name: 'Firecrawl' },
    name: 'rxapFirecrawl',
    inputs: [ NodeConnectionType.Main ],
    outputs: [ NodeConnectionType.Main ],
    displayName: 'Firecrawl',
    group: [ 'transform' ],
    icon: 'file:Firecrawl.svg',
    credentials: [
      {
        name: 'firecrawl',
        displayName: 'Firecrawl',
        required: true,
      },
      {
        name: 'postgres',
        displayName: 'Postgres',
        required: true,
        displayOptions: {
          show: {
            cache: ['postgres']
          }
        }
      }
    ],
    properties: [
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
        name: 'url',
        displayName: 'Url',
        type: 'string',
        required: true,
        default: '',
        description: 'The url to scrape',
      },
      {
        name: 'formats',
        displayName: 'Formats',
        type: 'multiOptions',
        options: [
          {
            value: 'markdown',
            name: 'Markdown'
          },
          {
            value: 'html',
            name: 'HTML'
          },
          {
            value: 'rawHtml',
            name: 'Raw HTML'
          },
          {
            value: 'content',
            name: 'Content'
          },
          {
            value: 'links',
            name: 'Links'
          },
          {
            value: 'screenshot',
            name: 'Screenshot'
          },
          {
            value: 'screenshot@fullPage',
            name: 'Screenshot Full Page'
          },
          {
            value: 'extract',
            name: 'Extract'
          },
          {
            value: 'json',
            name: 'JSON'
          }
        ],
        default: ['markdown'],
      },
      {
        name: 'onlyMainContent',
        displayName: 'Only Main Content',
        description: 'Only return the main content of the page excluding headers, navs, footers, etc.',
        default: true,
        type: 'boolean',
      },
      {
        name: 'includeTags',
        displayName: 'Include Tags',
        default: [],
        type: 'string',
        typeOptions: {
          multipleValues: true
        },
        description: 'Only include tags, classes and ids from the page in the final output. Use comma separated values.'
      },
      {
        name: 'excludeTags',
        displayName: 'Exclude Tags',
        default: [],
        type: 'string',
        typeOptions: {
          multipleValues: true
        },
        description: 'Tags, classes and ids to remove from the page. Use comma separated values.'
      },
      {
        name: 'cache',
        displayName: 'Cache',
        default: 'postgres',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'None',
            value: 'none',
          },
          {
            name: 'Postgres',
            value: 'postgres',
          }
        ],
        description: 'Use the cache to speed up the scraping process. First checks the cache for existing results. If not found, it will call the firecrawl api. If the cache is enabled, the cache will be updated with the new results.'
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
      }
    ],
  };

  constructor() {
    this.description.properties.push(...this.buildProperties());


  }

  private buildProperties(): INodeProperties[] {
    return [];
  }

  @CaptureExecutionError()
  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][] | null> {

    const operation = this.getNodeParameter('operation', 0) as 'scrapeUrl' | string;
    const cache = this.getNodeParameter('cache', 0) as 'none' | 'postgres';
    const cacheTTL = this.getNodeParameter('cacheTTL', -1) as number;
    const {apiKey} = await this.getCredentials<{ apiKey: string }>('firecrawl');
    const firecrawl = new FireCrawlApp({apiKey});

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

    const scrapeUrl = async <T extends ZodSchema>(url: string, options: ScrapeParams<T>): Promise<Record<any, any>> => {
      const scrapeResult = await firecrawl.scrapeUrl(url, options);
      if (scrapeResult.success) {
        return scrapeResult as Record<any, any>;
      }
      throw new NodeOperationError(this.getNode(), `The operation "scrapeUrl" failed: ${scrapeResult.error}`);
    };

    const results = await forEachItem.call(this, async (_, index) => {

      const url = this.getNodeParameter('url', index) as string;
      const formats = this.getNodeParameter('formats', index, ['markdown']) as CrawlScrapeOptions['formats'];
      const onlyMainContent = this.getNodeParameter('onlyMainContent', index, true) as boolean;
      const includeTags = this.getNodeParameter('includeTags', index, null) as string[] | null;
      const excludeTags = this.getNodeParameter('excludeTags', index, null) as string[] | null;

      switch (operation) {

        case 'scrapeUrl':
          return {
            json: await cached({ keyv, ttl: cacheTTL > 0 ? cacheTTL : undefined }, scrapeUrl, url, {
              formats: formats,
              onlyMainContent,
              includeTags: includeTags?.length ? includeTags : undefined,
              excludeTags: excludeTags?.length ? excludeTags : undefined,
            })
          };
      }

      throw new NodeOperationError(
        this.getNode(),
        `The operation "${operation}" is not implemented.`,
      );

    });

    return [results];

  }

}
