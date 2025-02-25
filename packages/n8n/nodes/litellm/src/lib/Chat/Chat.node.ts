import {
  NodeConnectionType,
  type IExecuteFunctions,
  type INodeType,
  type INodeTypeDescription,
  type SupplyData,
  type JsonObject,
  NodeApiError,
} from 'n8n-workflow';
import {
  ChatOpenAI,
  type ClientOptions,
} from '@langchain/openai';
import { getConnectionHintNoticeField } from '../utils/sharedFields';
import { RateLimitError } from 'openai';
import { N8nLlmTracing } from '../N8nLlmTracing';
import { getCustomErrorMessage } from '../error-handling';

export class Chat implements INodeType {
  description: INodeTypeDescription = {
    version: 1,
    description: 'For advanced usage with an AI chain',
    defaults: { name: 'LiteLLM Chat' },
    name: 'liteLLMChat',
    inputs: [],
    outputs: [ NodeConnectionType.AiLanguageModel ],
    outputNames: ['Model'],
    displayName: 'LiteLLM Chat Model',
    group: [ 'transform' ],
    icon: 'file:Chat.png',
    codex: {
      categories: [ 'AI' ],
      subcategories: {
        AI: [ 'Language Models', 'Root Nodes' ],
        'Language Models': [ 'Text Completion Models' ],
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
      getConnectionHintNoticeField([ NodeConnectionType.AiChain, NodeConnectionType.AiAgent ]),
      {
        displayName:
          'If using JSON response format, you must include word "json" in the prompt in your chain or agent. Also, make sure to select latest models released post November 2023.',
        name: 'notice',
        type: 'notice',
        default: '',
        displayOptions: {
          show: {
            '/options.responseFormat': [ 'json_object' ],
          },
        },
      },
      {
        displayName: 'Model',
        name: 'model',
        type: 'options',
        description:
          'The model which will generate the completion. <a href="https://beta.openai.com/docs/models/overview">Learn more</a>.',
        typeOptions: {
          loadOptions: {
            routing: {
              request: {
                method: 'GET',
                url: '/v1/models',
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
        default: 'gemini/2.0-flash',
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
            displayName: 'Frequency Penalty',
            name: 'frequencyPenalty',
            default: 0,
            typeOptions: {
              maxValue: 2,
              minValue: -2,
              numberPrecision: 1,
            },
            description:
              'Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model\'s likelihood to repeat the same line verbatim',
            type: 'number',
          },
          {
            displayName: 'Maximum Number of Tokens',
            name: 'maxTokens',
            default: -1,
            description:
              'The maximum number of tokens to generate in the completion. Most models have a context length of 2048 tokens (except for the newest models, which support 32,768).',
            type: 'number',
            typeOptions: {
              maxValue: 32768,
            },
          },
          {
            displayName: 'Response Format',
            name: 'responseFormat',
            default: 'text',
            type: 'options',
            options: [
              {
                name: 'Text',
                value: 'text',
                description: 'Regular text response',
              },
              {
                name: 'JSON',
                value: 'json_object',
                description:
                  'Enables JSON mode, which should guarantee the message the model generates is valid JSON',
              },
            ],
          },
          {
            displayName: 'Presence Penalty',
            name: 'presencePenalty',
            default: 0,
            typeOptions: {
              maxValue: 2,
              minValue: -2,
              numberPrecision: 1,
            },
            description:
              'Positive values penalize new tokens based on whether they appear in the text so far, increasing the model\'s likelihood to talk about new topics',
            type: 'number',
          },
          {
            displayName: 'Sampling Temperature',
            name: 'temperature',
            default: 0.7,
            typeOptions: {
              maxValue: 1,
              minValue: 0,
              numberPrecision: 1,
            },
            description:
              'Controls randomness: Lowering results in less random completions. As the temperature approaches zero, the model will become deterministic and repetitive.',
            type: 'number',
          },
          {
            displayName: 'Timeout',
            name: 'timeout',
            default: 60000,
            description: 'Maximum amount of time a request is allowed to take in milliseconds',
            type: 'number',
          },
          {
            displayName: 'Max Retries',
            name: 'maxRetries',
            default: 2,
            description: 'Maximum number of retries to attempt',
            type: 'number',
          },
          {
            displayName: 'Top P',
            name: 'topP',
            default: 1,
            typeOptions: {
              maxValue: 1,
              minValue: 0,
              numberPrecision: 1,
            },
            description:
              'Controls diversity via nucleus sampling: 0.5 means half of all likelihood-weighted options are considered. We generally recommend altering this or temperature but not both.',
            type: 'number',
          },
        ],
      },
    ],
  };

  async supplyData(this: IExecuteFunctions, itemIndex: number): Promise<SupplyData> {
    const credentials = await this.getCredentials('litellm');

    const modelName = this.getNodeParameter('model', itemIndex) as string;
    const options = this.getNodeParameter('options', itemIndex, {}) as {
      frequencyPenalty?: number;
      maxTokens?: number;
      maxRetries: number;
      timeout: number;
      presencePenalty?: number;
      temperature?: number;
      topP?: number;
      responseFormat?: 'text' | 'json_object';
    };

    const configuration: ClientOptions = {};
    configuration.baseURL = credentials['baseURL'] as string;

    const model = new ChatOpenAI({
      openAIApiKey: credentials['apiKey'] as string,
      modelName,
      ...options,
      timeout: options.timeout ?? 60000,
      maxRetries: options.maxRetries ?? 2,
      configuration,
      callbacks: [ new N8nLlmTracing(this) ],
      modelKwargs: options.responseFormat
                   ? {
          response_format: { type: options.responseFormat },
        }
                   : undefined,
      onFailedAttempt: (error: any) => {
        // If the error is a rate limit error, we want to handle it differently
        // because OpenAI has multiple different rate limit errors
        if (error instanceof RateLimitError) {
          const errorCode = error?.code;
          if (errorCode) {
            const customErrorMessage = getCustomErrorMessage(errorCode);

            const apiError = new NodeApiError(this.getNode(), error as unknown as JsonObject);
            if (customErrorMessage) {
              apiError.message = customErrorMessage;
            }

            throw apiError;
          }
        }

        throw error;
      },
    });

    return {
      response: model,
    };
  }
}
