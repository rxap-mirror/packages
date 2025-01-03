import {
  Logger,
  LoggerService,
} from '@nestjs/common';
import {
  isNil,
  isString,
  isUndefined,
} from '@nestjs/common/utils/shared.utils';
import {
  CustomTransportStrategy,
  IncomingRequest,
  MessageHandler,
  OutgoingResponse,
  ReadPacket,
  RmqContext,
  Server,
  WritePacket,
} from '@nestjs/microservices';
import {
  CONNECT_EVENT,
  CONNECT_FAILED_EVENT,
  CONNECTION_FAILED_MESSAGE,
  DISCONNECT_EVENT,
  DISCONNECTED_RMQ_MESSAGE,
  ERROR_EVENT,
  NO_MESSAGE_HANDLER,
  RQM_NO_EVENT_HANDLER,
  RQM_NO_MESSAGE_HANDLER,
} from '@nestjs/microservices/constants';
import { RmqRecordSerializer } from '@nestjs/microservices/serializers';
import { ServerRmqOptions } from './options';
import { coerceArray } from '@rxap/utilities';
import {
  ChannelWrapper,
  connect,
} from 'amqp-connection-manager';
import type { IAmqpConnectionManager } from 'amqp-connection-manager/dist/types/AmqpConnectionManager';
import { Message } from 'amqplib';
import {
  catchError,
  EMPTY,
  finalize,
  Observable,
  Subscription,
} from 'rxjs';
import { ErrorSerializer } from './error.serializer';
import { RabbitMqIncomingRequestDeserializer } from './incoming-request.deserializer';

const INFINITE_CONNECTION_ATTEMPTS = -1;

export const TRANSPORT_ID = Symbol('RxAP_RMQ');

export class ServerRMQ extends Server implements CustomTransportStrategy {
  public readonly transportId = TRANSPORT_ID;

  protected server: IAmqpConnectionManager | null = null;
  protected channel: ChannelWrapper | null = null;
  protected connectionAttempts = 0;
  protected queue!: string;

  protected errorSerializer = new ErrorSerializer();

  constructor(
    protected readonly options: ServerRmqOptions,
    protected override readonly logger: LoggerService = new Logger(Server.name),
  ) {
    super();

    this.initializeSerializer(options);
    this.initializeDeserializer(options);
  }

  public async listen(
    callback: (err?: unknown, ...optionalParams: unknown[]) => void,
  ): Promise<void> {
    try {
      await this.start(callback);
    } catch (err) {
      callback(err);
    }
  }

  public close(): void {
    this.channel && this.channel.close();
    this.server && this.server.close();
  }

  public bindQueue(exchange: string, routingKey: string) {
    this.logger.verbose?.(`Binding queue to exchange '${ exchange }' with routing key '${ routingKey }'`, 'ServerRMQ');
    return this.channel!.bindQueue(this.queue, exchange, routingKey);
  }

  public async start(
    callback?: (err?: unknown, ...optionalParams: unknown[]) => void,
  ) {
    this.logger.verbose?.('Connecting to RMQ server...', 'ServerRMQ');
    this.server = this.createClient();

    this.server.addListener(ERROR_EVENT, (err: any) => this.logger.error(err, undefined, 'ServerRMQ'));

    this.server.on(CONNECT_EVENT, () => {
      if (this.channel) {
        return;
      }
      this.channel = this.server!.createChannel({
        json: false,
        setup: (channel: any) => this.setupChannel(channel, callback),
      });
    });

    const maxConnectionAttempts = this.getOptionsProp(
      this.options,
      'maxConnectionAttempts',
      INFINITE_CONNECTION_ATTEMPTS,
    );
    this.server.on(DISCONNECT_EVENT, (err: any) => {
      this.logger.error(DISCONNECTED_RMQ_MESSAGE + ': ' + err.message, undefined, 'ServerRMQ');
    });
    this.server.on(CONNECT_FAILED_EVENT, (error: Record<string, unknown>) => {
      this.logger.error(CONNECTION_FAILED_MESSAGE);
      if (error?.['err']) {
        this.logger.error(CONNECTION_FAILED_MESSAGE + ': ' + error['err'], undefined, 'ServerRMQ');
      }
      const isReconnecting = !!this.channel;
      if (
        maxConnectionAttempts === INFINITE_CONNECTION_ATTEMPTS ||
        isReconnecting
      ) {
        return;
      }
      if (++this.connectionAttempts === maxConnectionAttempts) {
        this.close();
        callback?.(error?.['err'] ?? new Error(CONNECTION_FAILED_MESSAGE));
      }
    });
  }

  public override send(
    stream$: Observable<any>,
    respond: (data: WritePacket) => unknown | Promise<unknown>,
  ): Subscription {
    let dataBuffer: WritePacket[] | null = null;
    const scheduleOnNextTick = (data: WritePacket) => {
      if (!dataBuffer) {
        dataBuffer = [data];
        process.nextTick(async () => {
          for (const item of dataBuffer!) {
            await respond(item);
          }
          dataBuffer = null;
        });
      } else if (!data.isDisposed) {
        dataBuffer = dataBuffer.concat(data);
      } else {
        dataBuffer[dataBuffer.length - 1].isDisposed = data.isDisposed;
      }
    };
    return stream$
      .pipe(
        catchError((err: any) => {
          scheduleOnNextTick({ err: this.errorSerializer.serialize(err) });
          return EMPTY;
        }),
        finalize(() => scheduleOnNextTick({ isDisposed: true })),
      )
      .subscribe((response: any) => scheduleOnNextTick({ response }));
  }

  public createClient() {
    const socketOptions = this.getOptionsProp(this.options, 'socketOptions');
    return connect(this.options.urls, socketOptions);
  }

  public async setupChannel(channel: ChannelWrapper, callback?: () => any) {
    if (!this.options.noAssert) {
      for (const exchange of coerceArray(this.options.exchange)) {
        await channel.assertExchange(exchange.name, exchange.type, exchange.options);
      }
      const { queue } = await channel.assertQueue(this.options.queue ?? '', this.options.queueOptions);
      this.queue = queue;
    } else {
      this.queue = this.options.queue ?? '';
    }
    const r = await (
      channel as any
    ).prefetch(this.options.prefetchCount ?? 0, this.options.isGlobalPrefetchCount);
    channel.consume(
      this.queue,
      (msg: Record<string, any>) => this.handleMessage(msg, channel),
      {
        prefetch: this.options.prefetchCount ?? 0,
        noAck: this.options.noAck ?? true,
        consumerTag: this.getOptionsProp(
          this.options,
          'consumerTag',
          undefined,
        ),
      },
    );
    callback?.();
  }

  public async handleMessage(
    message: Record<string, any>,
    channel: any,
  ): Promise<void> {
    this.logger.verbose?.('Message received', 'ServerRMQ');
    if (isNil(message)) {
      return;
    }
    const {
      content,
      properties,
      fields,
    } = message;
    const rawMessage = this.parseMessageContent(content);
    this.logger.verbose?.('Message content: %JSON', rawMessage, 'ServerRMQ');
    this.logger.verbose?.('Message properties: %JSON', properties, 'ServerRMQ');
    this.logger.verbose?.('Message fields: %JSON', fields, 'ServerRMQ');
    const packet = await this.deserializer.deserialize(rawMessage, {
      fields,
      properties,
    });
    this.logger.debug?.('Extracted packet message content: %JSON', packet, 'ServerRMQ');
    const pattern = (
      isString(packet.pattern) ? packet.pattern : JSON.stringify(packet.pattern)
    );
    const rmqContext = new RmqContext([ message, channel, pattern ]);
    if (isUndefined((
      packet as IncomingRequest
    ).id)) {
      this.logger.debug?.('Message without correlation id', 'ServerRMQ');
      return this.handleEvent(pattern, packet, rmqContext);
    }
    const handler = this.getHandlerByPattern(pattern);

    if (!handler) {
      if (!(
        this.options.noAck ?? true
      )) {
        this.logger.warn(RQM_NO_MESSAGE_HANDLER`${ pattern }`);
        this.channel!.nack(rmqContext.getMessage() as Message, false, false);
      }
      const status = 'error';
      const noHandlerPacket = {
        id: (
          packet as IncomingRequest
        ).id,
        err: NO_MESSAGE_HANDLER,
        status,
      };
      return this.sendMessage(
        noHandlerPacket,
        properties.replyTo,
        properties.correlationId,
      );
    }
    const response$ = this.transformToObservable(handler(packet.data, rmqContext));

    const publish = <T>(data: T) =>
      this.sendMessage(data, properties.replyTo, properties.correlationId);

    this.logger.verbose?.('Handling event and sending response', 'ServerRMQ');
    response$ && this.send(response$, publish);
  }

  public override async handleEvent(
    pattern: string,
    packet: ReadPacket,
    context: RmqContext,
  ): Promise<any> {
    const handler = this.getHandlerByPattern(pattern);
    if (!handler && !(
      this.options.noAck ?? true
    )) {
      this.channel!.nack(context.getMessage() as Message, false, false);
      return this.logger.warn(RQM_NO_EVENT_HANDLER`${ pattern }`);
    }
    return super.handleEvent(pattern, packet, context);
  }

  public sendMessage<T = any>(
    message: T,
    replyTo: any,
    correlationId: string,
  ): void {
    const outgoingResponse = this.serializer.serialize(
      message as unknown as OutgoingResponse,
    );
    const options = outgoingResponse.options;
    delete outgoingResponse.options;

    const buffer = Buffer.from(JSON.stringify(outgoingResponse));
    this.channel!.sendToQueue(replyTo, buffer, { correlationId, ...options });
  }

  public override addHandler(
    pattern: any,
    callback: MessageHandler,
    isEventHandler?: boolean,
    extras?: Record<any, any>,
  ) {
    this.logger.log(`Adding message handler for pattern '${ pattern }'`, 'ServerRMQ');
    super.addHandler(pattern, callback, isEventHandler, extras);
  }

  protected override initializeDeserializer(options: ServerRmqOptions) {
    this.deserializer = options?.deserializer ?? new RabbitMqIncomingRequestDeserializer();
  }

  protected override initializeSerializer(options: ServerRmqOptions) {
    this.serializer = options?.serializer ?? new RmqRecordSerializer();
  }

  private parseMessageContent(content: Buffer) {
    try {
      return JSON.parse(content.toString());
    } catch {
      return content.toString();
    }
  }

}
