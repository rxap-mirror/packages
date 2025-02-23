import {
  capitalize,
  CoerceSuffix,
  dasherize,
} from '@rxap/utilities';
import { Message } from 'amqplib';
import {
  existsSync,
  readFileSync,
} from 'fs';
import {
  IDeferredPromise,
  IExecuteResponsePromiseData,
  INodeProperties,
  INodeType,
  INodeTypeDescription,
  IRun,
  ITriggerFunctions,
  ITriggerResponse,
  NodeConnectionType,
  NodeOperationError,
} from 'n8n-workflow';
import { OpenAPIV3 } from 'openapi-types';
import {
  MessageTracker,
  parseMessage,
  rabbitmqCreateChannel,
} from './GenericFunctions';
import {
  type ExchangeType,
  TriggerOptions,
} from './types';

type Schema = OpenAPIV3.SchemaObject & { id?: string };

const CUSTOM_OPERATION = '__CUSTOM_OPERATION__';

export class PatternTriggerNode implements INodeType {

  description: INodeTypeDescription;
  patterns: Schema;

  constructor(
    private readonly schemaFilePath: string,
    private readonly routingKeyPrefix: 'command' | 'query' | 'event',
  ) {
    this.patterns = this.loadPatters();
    // use || instead of ?? to ensure an empty string is also replaced
    const name = CoerceSuffix((this.patterns.id || dasherize(this.patterns.title || this.constructor.name)), 'Trigger');
    this.description = {
      version: 1,
      // use || instead of ?? to ensure an empty string is also replaced
      description: this.patterns.description || capitalize(this.constructor.name),
      defaults: {
        name: capitalize(this.constructor.name),
      },
      name,
      inputs: [ ],
      triggerPanel: {
        header: '',
        executionsHelp: {
          inactive:
            "<b>While building your workflow</b>, click the 'listen' button, then trigger a Rabbit MQ event. This will trigger an execution, which will show up in this editor.<br /> <br /><b>Once you're happy with your workflow</b>, <a data-key='activate'>activate</a> it. Then every time a change is detected, the workflow will execute. These executions will show up in the <a data-key='executions'>executions list</a>, but not in the editor.",
          active:
            "<b>While building your workflow</b>, click the 'listen' button, then trigger a Rabbit MQ event. This will trigger an execution, which will show up in this editor.<br /> <br /><b>Your workflow will also execute automatically</b>, since it's activated. Every time a change is detected, this node will trigger an execution. These executions will show up in the <a data-key='executions'>executions list</a>, but not in the editor.",
        },
        activationHint:
          "Once you’ve finished building your workflow, <a data-key='activate'>activate</a> it to have it also listen continuously (you just won’t see those executions here).",
      },
      outputs: [ NodeConnectionType.Main ],
      subtitle: `={{ $parameter["operation"].replace(/^(command|event|query)./, '').replace(/(Command|Event|Query)$/, '').replace(/([a-z\\d])([A-Z])/g, '$1 $2') }}`,
      // use || instead of ?? to ensure, an empty string is also replaced
      displayName: (this.patterns.title || capitalize(this.constructor.name)) + ' Trigger',
      group: [ 'trigger' ],
      credentials: [
        {
          name: 'rabbitmq',
          required: true
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
      icon: { light: `file:${this.constructor.name.replace(/Trigger$/, '')}.svg`, dark: `file:${this.constructor.name.replace(/Trigger$/, '')}.dark.svg` },
    };
    this.populateDescription();
  }

  async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {

    const queue = this.getNodeParameter('queue', 'n8n') as string;
    const exchange = this.getNodeParameter('exchange', 'cqrs') as string;
    const exchangeType = this.getNodeParameter('exchangeType', 'topic') as ExchangeType;
    const operation = this.getNodeParameter('operation') as string;
    const options = this.getNodeParameter('options', {}) as TriggerOptions;

    const channel = await rabbitmqCreateChannel.call(this);
    await channel.assertQueue(queue, options);

    // TODO load the exchange from node parameters
    await channel.assertExchange(exchange, exchangeType, { durable: false, autoDelete: false });

    let routingKey: string;
    if (operation === CUSTOM_OPERATION) {
      routingKey = [
        this.getNodeParameter('routingKeyPrefix') as string,
        this.getNodeParameter('pattern') as string,
      ].join('.');
    } else {
      routingKey = operation;
    }

    await channel.bindQueue(queue, exchange, routingKey);

    if (this.getMode() === 'manual') {
      const manualTriggerFunction = async () => {
        // Do only catch a single message when executing manually, else messages will leak
        await channel.prefetch(1);

        const processMessage = async (message: Message | null) => {
          if (message !== null) {
            const item = await parseMessage(message, options, this.helpers);
            channel.ack(message);
            this.emit([[item]]);
          } else {
            this.emitError(new Error('Connection got closed unexpectedly'));
          }
        };

        const existingMessage = await channel.get(queue);
        if (existingMessage) {
          await processMessage(existingMessage);
        } else {
          await channel.consume(queue, processMessage);
        }
      };

      const closeFunction = async () => {
        await channel.close();
        await channel.connection.close();
        return;
      };

      return {
        closeFunction,
        manualTriggerFunction,
      };
    }

    const parallelMessages = options.parallelMessages ?? -1;
    if (isNaN(parallelMessages) || parallelMessages === 0 || parallelMessages < -1) {
      throw new NodeOperationError(
        this.getNode(),
        'Parallel message processing limit must be a number greater than zero (or -1 for no limit)',
      );
    }

    let acknowledgeMode = options.acknowledge ?? 'immediately';

    if (parallelMessages !== -1 && acknowledgeMode === 'immediately') {
      // If parallel message limit is set, then the default mode is "executionFinishes"
      // unless acknowledgeMode got set specifically. Be aware that the mode "immediately"
      // can not be supported in this case.
      acknowledgeMode = 'executionFinishes';
    }

    const messageTracker = new MessageTracker();
    let closeGotCalled = false;

    if (parallelMessages !== -1) {
      await channel.prefetch(parallelMessages);
    }

    channel.on('close', () => {
      if (!closeGotCalled) {
        this.emitError(new Error('Connection got closed unexpectedly'));
      }
    });

    const consumerInfo = await channel.consume(queue, async (message) => {
      if (message !== null) {
        try {
          if (acknowledgeMode !== 'immediately') {
            messageTracker.received(message);
          }

          const item = await parseMessage(message, options, this.helpers);

          let responsePromise: IDeferredPromise<IRun> | undefined = undefined;
          let responsePromiseHook: IDeferredPromise<IExecuteResponsePromiseData> | undefined =
            undefined;
          if (acknowledgeMode !== 'immediately' && acknowledgeMode !== 'laterMessageNode') {
            responsePromise = this.helpers.createDeferredPromise();
          } else if (acknowledgeMode === 'laterMessageNode') {
            responsePromiseHook = this.helpers.createDeferredPromise<IExecuteResponsePromiseData>();
          }
          if (responsePromiseHook) {
            this.emit([[item]], responsePromiseHook, undefined);
          } else {
            this.emit([[item]], undefined, responsePromise);
          }
          if (responsePromise && acknowledgeMode !== 'laterMessageNode') {
            // Acknowledge message after the execution finished
            await responsePromise.promise.then(async (data: IRun) => {
              if (data.data.resultData.error) {
                // The execution did fail
                if (acknowledgeMode === 'executionFinishesSuccessfully') {
                  channel.nack(message);
                  messageTracker.answered(message);
                  return;
                }
              }
              channel.ack(message);
              messageTracker.answered(message);
            });
          } else if (responsePromiseHook && acknowledgeMode === 'laterMessageNode') {
            await responsePromiseHook.promise.then(() => {
              channel.ack(message);
              messageTracker.answered(message);
            });
          } else {
            // Acknowledge message directly
            channel.ack(message);
          }
        } catch (error: any) {
          const workflow = this.getWorkflow();
          const node = this.getNode();
          if (acknowledgeMode !== 'immediately') {
            messageTracker.answered(message);
          }

          this.logger.error(
            `There was a problem with the RabbitMQ Trigger node "${node.name}" in workflow "${workflow.id}": "${error.message}"`,
            {
              node: node.name,
              workflowId: workflow.id,
            },
          );
        }
      }
    });
    const consumerTag = consumerInfo.consumerTag;

    // The "closeFunction" function gets called by n8n whenever
    // the workflow gets deactivated and can so clean up.
    const closeFunction = async () => {
      closeGotCalled = true;
      try {
        return await messageTracker.closeChannel(channel, consumerTag);
      } catch (error: any) {
        const workflow = this.getWorkflow();
        const node = this.getNode();
        this.logger.error(
          `There was a problem closing the RabbitMQ Trigger node connection "${node.name}" in workflow "${workflow.id}": "${error.message}"`,
          {
            node: node.name,
            workflowId: workflow.id,
          },
        );
      }
    };

    return {
      closeFunction,
    };

  }

  protected populateDescription(): void {
    this.description.properties.push(this.buildOperationProperty(this.patterns));
    this.description.properties.push(this.buildPatternForCustomOperation());
    this.description.properties.push(this.buildOptionsProperty());
  }

  private buildPatternForCustomOperation(): INodeProperties {
    return {
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
    };
  }

  private buildOptionsProperty(): INodeProperties {
    return {
      displayName: 'Options',
      name: 'options',
      type: 'collection',
      default: {
        jsonParseBody: true,
        onlyContent: true,
      },
      placeholder: 'Add option',
      options: [
        {
          displayName: 'Delete From Queue When',
          name: 'acknowledge',
          type: 'options',
          options: [
            {
              name: 'Execution Finishes',
              value: 'executionFinishes',
              description:
                'After the workflow execution finished. No matter if the execution was successful or not.',
            },
            {
              name: 'Execution Finishes Successfully',
              value: 'executionFinishesSuccessfully',
              description: 'After the workflow execution finished successfully',
            },
            {
              name: 'Immediately',
              value: 'immediately',
              description: 'As soon as the message got received',
            },
            {
              name: 'Specified Later in Workflow',
              value: 'laterMessageNode',
              description: 'Using a RabbitMQ node to remove the item from the queue',
            },
          ],
          default: 'immediately',
          description: 'When to acknowledge the message',
        },
        {
          displayName: 'JSON Parse Body',
          name: 'jsonParseBody',
          type: 'boolean',
          default: true,
          description: 'Whether to parse the body to an object',
        },
        {
          displayName: 'Only Content',
          name: 'onlyContent',
          type: 'boolean',
          default: true,
          description: 'Whether to return only the content property',
        },
        {
          displayName: 'Parallel Message Processing Limit',
          name: 'parallelMessages',
          type: 'number',
          default: -1,
          displayOptions: {
            hide: {
              acknowledge: ['immediately'],
            },
          },
          description: 'Max number of executions at a time. Use -1 for no limit.',
        },
      ],
    };
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

  private loadPatters(): Schema {
    const filePath = this.schemaFilePath;

    if (!existsSync(filePath)) {
      throw new Error(`The schema file "${ filePath }" does not exist.`);
    }

    return JSON.parse(readFileSync(filePath, 'utf8'));
  }

}
