import { CaptureExecutionError } from '@rxap/n8n-utilities';
import {
  capitalize,
  dasherize,
} from '@rxap/utilities';
import type { Channel } from 'amqplib';
import {
  existsSync,
  readFileSync,
} from 'fs';
import {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeProperties,
  INodeType,
  INodeTypeDescription,
  NodeConnectionType,
  NodeOperationError,
} from 'n8n-workflow';
import { OpenAPIV3 } from 'openapi-types';
import {
  filter,
  firstValueFrom,
  Subject,
  takeUntil,
  tap,
} from 'rxjs';
import { v4 as uuid } from 'uuid';
import {
  parsePublishArguments,
  rabbitmqConnectExchange,
} from './GenericFunctions';
import { Options } from './types';

type Schema = OpenAPIV3.SchemaObject & { id?: string };

function isSchemaObject(schema: any): schema is OpenAPIV3.SchemaObject {
  return schema?.type !== undefined;
}

const REPLY_QUEUE = 'amq.rabbitmq.reply-to';

const CUSTOM_OPERATION = '__CUSTOM_OPERATION__';

export abstract class PatternNode implements INodeType {

  description: INodeTypeDescription;
  patterns: Schema;

  constructor(
    private readonly schemaFilePath: string,
    private readonly routingKeyPrefix: 'command' | 'query' | 'event',
    private readonly withReplyQueue = false,
  ) {
    this.patterns = this.loadPatters();
    // use || instead of ?? to ensure an empty string is also replaced
    const name = this.patterns.id || dasherize(this.patterns.title || this.constructor.name);
    this.description = {
      version: 1,
      // use || instead of ?? to ensure an empty string is also replaced
      description: this.patterns.description || capitalize(this.constructor.name),
      defaults: {
        name: capitalize(this.constructor.name),
      },
      name,
      inputs: [ NodeConnectionType.Main ],
      outputs: [ NodeConnectionType.Main ],
      subtitle: `={{ $parameter["operation"].replace(/^(command|event|query)./, '').replace(/(Command|Event|Query)$/, '').replace(/([a-z\\d])([A-Z])/g, '$1 $2') }}`,
      // use || instead of ?? to ensure, an empty string is also replaced
      displayName: this.patterns.title || capitalize(this.constructor.name),
      group: [ 'transform' ],
      credentials: [
        {
          name: 'rabbitmq',
          required: true,
        },
      ],
      properties: [
        {
          name: 'routingKeyPrefix',
          default: this.routingKeyPrefix,
          type: 'string',
          description: 'The prefix for the routing key',
          displayName: 'Routing Key Prefix',
          hint: 'The prefix add before the defined pattern seperated by a dot',
          displayOptions: {
            show: {
              operation: [ CUSTOM_OPERATION ],
            },
          },
        }
      ],
      icon: {
        light: `file:${ this.constructor.name }.svg`,
        dark: `file:${ this.constructor.name }.dark.svg`,
      },
    };
    this.populateDescription();
  }

  @CaptureExecutionError()
  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    let channel: Channel | undefined;

    const items = this.getInputData();
    const returnItems: INodeExecutionData[] = Array(items.length).fill(null);
    const exchange = this.getNodeParameter('exchange', 0, 'cqrs') as string;
    const options = this.getNodeParameter('options', 0, {}) as Options;
    const replyQueue = this.getNodeParameter('replyQueue', 0, false) as boolean;
    const spread = this.getNodeParameter('spread', 0, false) as boolean;
    const operation = this.getNodeParameter('operation', 0) as string;

    try {
      channel = await rabbitmqConnectExchange.call(this, exchange, options);
    } catch (error: any) {
      throw new NodeOperationError(this.getNode(), `Failed to connect to exchange: ${ error.message }`);
    }

    const responseEmitter = new Subject<{
      correlationId: string, payload: { result?: any, response?: any, err?: { status: number, message: string, name: string }, error?: { message: string, name: string } }
    }>();

    if (replyQueue) {
      this.logger.info('Listening for replies on queue: ' + REPLY_QUEUE);
      await channel.consume(REPLY_QUEUE, msg => {
        if (msg) {
          this.logger.debug(`Received reply for correlationId: ${ msg.properties.correlationId }`);
          responseEmitter.next({
            correlationId: msg.properties.correlationId,
            payload: JSON.parse(msg.content.toString()),
          });
        } else {
          this.logger.warn('Received empty message');
        }
      }, { noAck: true });
    }

    const replayQueuePromise: Promise<any>[] = [];
    for (let i = 0; i < items.length; i++) {
      const payload = this.getNodeParameter('payload', i, {}) as IDataObject | string;

      const message = typeof payload === 'string' ? payload : JSON.stringify(payload);

      let routingKey: string;
      if (operation === CUSTOM_OPERATION) {
        routingKey = [
          this.getNodeParameter('routingKeyPrefix', i) as string,
          this.getNodeParameter('pattern', i) as string,
        ].join('.');
      } else {
        routingKey = operation;
      }

      let headers: IDataObject = {};
      if (options.headers && (
        (
          options.headers as IDataObject
        )['header']! as IDataObject[]
      ).length) {
        const itemOptions = this.getNodeParameter('options', i, {});
        const additionalHeaders: IDataObject = {};
        (
          (
            itemOptions['headers'] as IDataObject
          )['header'] as IDataObject[]
        ).forEach(
          (header: IDataObject) => {
            additionalHeaders[header['key'] as string] = header['value'];
          },
        );
        headers = additionalHeaders;
      }

      const correlationId = uuid();
      const cancel = new Subject<void>();
      if (replyQueue) {
        this.logger.info(`Waiting for reply for correlationId: ${ correlationId } for item ${ i }`);
        replayQueuePromise.push(firstValueFrom(responseEmitter.pipe(
          takeUntil(cancel),
          filter(item => item.correlationId === correlationId),
          tap(item => {
            const error = item.payload.err || item.payload.error;
            const response = item.payload.response || item.payload.result;
            if (error) {
              returnItems[i] = {
                json: error,
                error: new NodeOperationError(this.getNode(), error.message, { level: 'error' }),
              };
            } else if (response) {
              this.logger.info(`Received response for correlationId: ${ correlationId } for item ${ i }`);
              if (spread) {
                let rows = [];
                if (Array.isArray(response)) {
                  rows = response.map((row: any) => (
                    { json: row }
                  ));
                } else if (typeof response === 'object' && Array.isArray(response.rows)) {
                  rows = response.rows.map((row: any) => (
                    { json: row }
                  ));
                }
                if (rows.length) {
                  returnItems[i] = rows.shift();
                  returnItems.push(...rows);
                }
              } else {
                returnItems[i] = { json: response };
              }
            } else {
              this.logger.warn(`Received empty response for correlationId: ${ correlationId } for item ${ i }: ${JSON.stringify(item.payload)}`);
            }
          }),
        )));
      }

      const ok = channel.publish(exchange, routingKey, Buffer.from(message), {
        headers,
        correlationId: replyQueue ? correlationId : undefined,
        replyTo: replyQueue ? REPLY_QUEUE : undefined,
        ...parsePublishArguments(options),
      });

      if (!ok) {
        this.logger.warn(`Failed to publish message to exchange "${ exchange }" with routing key "${ routingKey }" for item ${ i }.`);
        cancel.next();
        throw new NodeOperationError(this.getNode(), 'Failed to publish message');
      } else {
        this.logger.debug(`Published message to exchange "${ exchange }" with routing key "${ routingKey }" for item ${ i } successfully.`);
        returnItems[i] ??= {
          json: {
            success: true,
          },
        };
      }
    }

    await Promise.allSettled(replayQueuePromise);
    this.logger.debug(`All responses received`);

    try {
      await channel.close();
      await channel.connection.close();
    } catch (error: any) {
      throw new NodeOperationError(this.getNode(), `Failed to close channel: ${ error.message }`);
    }

    return [ returnItems.filter(Boolean) ];
  }

  protected populateDescription(): void {
    this.description.properties.push(...this.buildExchangeProperty());
    this.description.properties.push(this.buildOperationProperty(this.patterns));
    this.description.properties.push(...this.buildOperationPayloadProperties(this.patterns.properties));
    this.description.properties.push(...this.buildPropertiesForCustomOperation());
    this.description.properties.push(this.buildSpreadProperty());
  }

  private buildSpreadProperty(): INodeProperties {
    return {
      name: 'spread',
      displayName: 'Spread Response',
      default: false,
      description: 'The items of the array response will be spread into individual items.',
      type: 'boolean',
    };
  }

  private buildOperationPayloadProperties(schemas: Record<string, OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject> = {}) {
    const properties: INodeProperties[] = [];
    for (const [ pattern, schema ] of Object.entries(schemas)) {
      if (isSchemaObject(schema)) {
        properties.push(this.buildPayloadPropertyForPattern(pattern, schema));
      }
    }
    return properties;
  }

  private buildOperationProperty(schema: Schema): INodeProperties {
    const properties: Record<string, Schema> = (
      schema.properties ?? {}
    ) as any;
    const patternList = Object.keys(properties);
    return {
      name: 'operation',
      displayName: 'Operation',
      default: patternList[0] ?? CUSTOM_OPERATION,
      type: 'options',
      options: patternList.map((pattern) => (
        {
          name: properties[pattern]?.title ?? pattern.replace(/^[^.]+./, ''),
          action: properties[pattern]?.title ?? pattern.replace(/^[^.]+./, ''),
          description: properties[pattern]?.description,
          value: pattern,
        }
      )).concat([
        {
          name: 'Custom',
          action: 'Custom',
          description: 'A operation with a custom pattern',
          value: CUSTOM_OPERATION,
        },
      ]),
    };
  }

  // region schema to n8n node properties
  private buildPropertyForSchema(propertyName: string | null, schema: Schema): INodeProperties {
    switch (schema.type) {

      case 'string':
      case 'number':
      case 'boolean':
        return this.buildPropertyForSchemaPrimitive(propertyName, schema as any);

      case 'array':
        return this.buildPropertyForSchemaArray(propertyName, schema as any);

      case 'object':
        return this.buildPropertyForSchemaObject(propertyName, schema as any);

      default:
        if (Object.keys(schema.properties ?? {}).length) {
          return this.buildPropertyForSchemaObject(propertyName, schema as any);
        }
        if ((
          schema as any
        ).items) {
          return this.buildPropertyForSchemaArray(propertyName, schema as any);
        }
        return {
          name: propertyName ? propertyName : 'payload',
          displayName: propertyName ? schema.title ?? propertyName : 'Payload',
          type: 'json',
          default: '',
          description: schema.description,
        };
    }
  }

  private buildStringPropertyDefault(schema: Schema & { type: 'string' }) {
    switch (schema.format) {
      case 'uuid':
        return uuid();
      default:
        return schema.default ?? '';
    }
  }

  private buildPropertyForSchemaPrimitive(
    propertyName: string | null, schema: Schema & { type: 'string' | 'number' | 'boolean' }): INodeProperties {
    switch (schema.type) {
      case 'string':
        if (schema.enum) {
          return {
            name: propertyName ? propertyName : 'payload',
            displayName: propertyName ? schema.title ?? propertyName : 'Payload',
            type: 'options',
            default: schema.default ?? '',
            description: schema.description,
            options: schema.enum.map((value) => (
              {
                name: value,
                value,
              }
            )),
          };
        }
        return {
          name: propertyName ? propertyName : 'payload',
          displayName: propertyName ? schema.title ?? propertyName : 'Payload',
          type: 'string',
          default: this.buildStringPropertyDefault(schema as any),
          description: schema.description,
        };

      case 'number':
        return {
          name: propertyName ? propertyName : 'payload',
          displayName: propertyName ? schema.title ?? propertyName : 'Payload',
          type: 'number',
          default: schema.default ?? 0,
          description: schema.description,
        };

      case 'boolean':
        return {
          name: propertyName ? propertyName : 'payload',
          displayName: propertyName ? schema.title ?? propertyName : 'Payload',
          type: 'boolean',
          default: schema.default ?? false,
          description: schema.description,
        };

      default:
        throw new Error(`Unsupported primitive schema type: ${ schema.type }`);
    }
  }

  private buildPropertyForSchemaArray(
    propertyName: string | null, schema: Schema & { type: 'array' }): INodeProperties {
    const items = (
      schema.items ?? {}
    ) as Schema;
    let options: Array<INodeProperties> = [];
    if (Object.keys(items).length) {
      options = [ this.buildPropertyForSchema('item', items) ];
    } else {
      options = [
        {
          name: 'item',
          displayName: 'Item',
          type: 'json',
          default: '',
        },
      ];
    }
    return {
      name: propertyName ? propertyName : 'payload',
      displayName: propertyName ? schema.title ?? propertyName : 'Payload',
      description: schema.description,
      type: 'fixedCollection',
      default: schema.default ?? [],
      typeOptions: {
        multipleValues: true,
      },
      options: [
        {
          name: 'item',
          displayName: 'Item',
          values: options,
        },
      ],
    };

  }

  private buildPropertyDefault(schema: Schema & { type: 'object' }) {
    const defaultObj: Record<string, any> = schema.default ?? {};
    for (const propertyName of schema.required ?? []) {
      const property = schema.properties?.[propertyName] as OpenAPIV3.SchemaObject | undefined;
      switch (property?.type) {
        case 'string':
        case 'number':
        case 'boolean':
          if (defaultObj[propertyName] === undefined) {
            defaultObj[propertyName] = null;
          }
          break;
        case 'object':
          if (defaultObj[propertyName] === undefined) {
            defaultObj[propertyName] = {};
          }
          break;
      }
    }
    // remove empty arrays from the default object
    for (const [ key, value ] of Object.entries(defaultObj)) {
      if (Array.isArray(value) && value.length === 0) {
        delete defaultObj[key];
      }
    }
    return defaultObj;
  }

  private buildPropertyForSchemaObject(
    propertyName: string | null, schema: Schema & { type: 'object' }): INodeProperties {
    return {
      name: propertyName ? propertyName : 'payload',
      displayName: propertyName ? schema.title ?? propertyName : 'Payload',
      type: 'collection',
      default: this.buildPropertyDefault(schema),
      description: schema.description,
      options: Object.entries(schema.properties ?? {}).map(
        ([ propertyName, schema ]) => this.buildPropertyForSchema(propertyName, schema as any)),
    };
  }

  // endregion

  private buildPropertiesForCustomOperation(): INodeProperties[] {
    return [
      {
        name: 'pattern',
        displayName: 'Pattern',
        type: 'string',
        default: '',
        description: 'Prefix free pattern for the custom operation',
        required: true,
        displayOptions: {
          show: {
            operation: [ CUSTOM_OPERATION ],
          },
        },
      },
      {
        name: 'payload',
        displayName: 'Payload',
        type: 'json',
        default: '',
        description: 'Payload for a custom operation',
        required: true,
        displayOptions: {
          show: {
            operation: [ CUSTOM_OPERATION ],
          },
        },
      },
    ];
  }

  private buildPayloadPropertyForPattern(pattern: string, schema: Schema): INodeProperties {
    return {
      ...this.buildPropertyForSchema(null, schema),
      required: true,
      displayOptions: {
        show: {
          operation: [ pattern ],
        },
      },
    };
  }

  private loadPatters(): Schema {
    const filePath = this.schemaFilePath;

    if (!existsSync(filePath)) {
      throw new Error(`The schema file "${ filePath }" does not exist.`);
    }

    return JSON.parse(readFileSync(filePath, 'utf8'));
  }

  private buildExchangeProperty(): INodeProperties[] {
    return [
      {
        name: 'replyQueue',
        displayName: 'Reply Queue',
        type: 'hidden',
        default: this.withReplyQueue,
      },
      {
        name: 'exchange',
        displayName: 'Exchange',
        type: 'string',
        default: 'cqrs',
        description: 'The exchange to publish the message to',
      },
      {
        name: 'exchangeType',
        displayName: 'Exchange Type',
        type: 'hidden',
        default: 'topic',
      },
      {
        displayName: 'Options',
        name: 'options',
        type: 'collection',
        default: {},
        placeholder: 'Add option',
        options: [
          {
            displayName: 'Alternate Exchange',
            name: 'alternateExchange',
            type: 'string',
            default: '',
            description:
              'An exchange to send messages to if this exchange can’t route them to any queues',
          },
          {
            displayName: 'Arguments',
            name: 'arguments',
            placeholder: 'Add Argument',
            description:
              'Arguments to add, See <a href="https://amqp-node.github.io/amqplib/channel_api.html#channel_publish" target="_blank">here</a> for valid options',
            type: 'fixedCollection',
            typeOptions: {
              multipleValues: true,
            },
            default: {},
            options: [
              {
                name: 'argument',
                displayName: 'Argument',
                values: [
                  {
                    displayName: 'Key',
                    name: 'key',
                    type: 'string',
                    default: '',
                  },
                  {
                    displayName: 'Value',
                    name: 'value',
                    type: 'string',
                    default: '',
                  },
                ],
              },
            ],
          },
          {
            displayName: 'Auto Delete Queue',
            name: 'autoDelete',
            type: 'boolean',
            default: false,
            description:
              'Whether the queue will be deleted when the number of consumers drops to zero',
          },
          {
            displayName: 'Durable',
            name: 'durable',
            type: 'boolean',
            default: true,
            description: 'Whether the queue will survive broker restarts',
          },
          {
            displayName: 'Headers',
            name: 'headers',
            placeholder: 'Add Header',
            description: 'Headers to add',
            type: 'fixedCollection',
            typeOptions: {
              multipleValues: true,
            },
            default: {},
            options: [
              {
                name: 'header',
                displayName: 'Header',
                values: [
                  {
                    displayName: 'Key',
                    name: 'key',
                    type: 'string',
                    default: '',
                  },
                  {
                    displayName: 'Value',
                    name: 'value',
                    type: 'string',
                    default: '',
                  },
                ],
              },
            ],
          },
        ],
      },
    ];
  }

}
