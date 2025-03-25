import { OpenAIEmbeddings } from '@langchain/openai';
import {
    type IExecuteFunctions,
    INodeProperties,
    type INodeType,
    type INodeTypeDescription,
    ISupplyDataFunctions,
    NodeConnectionType,
    type SupplyData,
} from 'n8n-workflow';
import type { ClientOptions } from 'openai';
import { logWrapper } from '../utils/logWrapper';
import { getConnectionHintNoticeField } from '../utils/sharedFields';

const modelParameter: INodeProperties = {
    displayName: 'Model',
    name: 'model',
    type: 'options',
    description:
      'The model which will generate the embeddings. <a href="https://platform.openai.com/docs/models/overview">Learn more</a>.',
    typeOptions: {
        loadOptions: {
            routing: {
                request: {
                    method: 'GET',
                    url: '={{ $parameter.options?.baseURL?.split("/").slice(-1).pop() || "v1"  }}/models',
                },
                output: {
                    postReceive: [
                        {
                            type: 'rootProperty',
                            properties: {
                                property: 'data',
                            },
                        },
                        {
                            type: 'filter',
                            properties: {
                                pass: "={{ $responseItem.id.includes('embed') }}",
                            },
                        },
                        {
                            type: 'setKeyValue',
                            properties: {
                                name: '={{$responseItem.id}}',
                                value: '={{$responseItem.id}}',
                            },
                        },
                        {
                            type: 'sort',
                            properties: {
                                key: 'name',
                            },
                        },
                    ],
                },
            },
        },
    },
    routing: {
        send: {
            type: 'body',
            property: 'model',
        },
    },
    default: 'text-embedding-3-small',
};

export class Embeddings implements INodeType {
  description: INodeTypeDescription = {
      version: 1,
      description: 'For advanced usage with an AI chain',
      defaults: { name: 'Embeddings LiteLLM' },
      name: 'liteLLMEmbeddings',
      inputs: [  ],
      outputs: [NodeConnectionType.AiEmbedding],
      outputNames: ['Embeddings'],
      displayName: 'Embeddings LiteLLM',
      group: ['transform'],
      icon: 'file:Embeddings.png',
      codex: {
          categories: ['AI'],
          subcategories: {
              AI: ['Embeddings'],
          },
      },
      requestDefaults: {
          ignoreHttpStatusErrors: true,
          baseURL: '={{ $credentials.baseURL }}',
      },
      credentials: [
          {
              name: 'litellm',
              required: true,
          },
      ],
      properties: [
          getConnectionHintNoticeField([NodeConnectionType.AiVectorStore]),
          {
              ...modelParameter,
              default: 'embedding/text-embedding-3-small',
              displayOptions: {
                  show: {
                      '@version': [1],
                  },
              },
          },
          {
              ...modelParameter,
              displayOptions: {
                  hide: {
                      '@version': [1],
                  },
              },
          },
          {
              displayName: 'Options',
              name: 'options',
              placeholder: 'Add Option',
              description: 'Additional options to add',
              type: 'collection',
              default: {},
              options: [
                  {
                      displayName: 'Batch Size',
                      name: 'batchSize',
                      default: 512,
                      typeOptions: { maxValue: 2048 },
                      description: 'Maximum number of documents to send in each request',
                      type: 'number',
                  },
                  {
                      displayName: 'Strip New Lines',
                      name: 'stripNewLines',
                      default: true,
                      description: 'Whether to strip new lines from the input text',
                      type: 'boolean',
                  },
                  {
                      displayName: 'Timeout',
                      name: 'timeout',
                      default: -1,
                      description:
                        'Maximum amount of time a request is allowed to take in seconds. Set to -1 for no timeout.',
                      type: 'number',
                  },
              ],
          },
      ]
    };

    async supplyData(this: ISupplyDataFunctions, itemIndex: number): Promise<SupplyData> {
        this.logger.debug('Supply data for embeddings');
        const credentials = await this.getCredentials('litellm');

        const options = this.getNodeParameter('options', itemIndex, {}) as {
            batchSize?: number;
            stripNewLines?: boolean;
            timeout?: number;
        };

        if (options.timeout === -1) {
            options.timeout = undefined;
        }

        const configuration: ClientOptions = {};
        configuration.baseURL = credentials['baseURL'] as string;

        const embeddings = new OpenAIEmbeddings(
          {
              modelName: this.getNodeParameter('model', itemIndex, 'text-embedding-3-small') as string,
              openAIApiKey: credentials['apiKey'] as string,
              ...options,
              configuration,
          },
        );

        return {
            response: logWrapper(embeddings, this),
        };
    }
}
