import { Logger } from '@nestjs/common/services/logger.service';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { isFunction } from '@nestjs/common/utils/shared.utils';
import {
  ClientProxy,
  ReadPacket,
  RmqRecord,
  WritePacket,
} from '@nestjs/microservices';
import {
  CONNECT_EVENT,
  CONNECT_FAILED_EVENT,
  DISCONNECT_EVENT,
  DISCONNECTED_RMQ_MESSAGE,
  ERROR_EVENT,
  RQM_DEFAULT_NO_ASSERT,
  RQM_DEFAULT_NOACK,
  RQM_DEFAULT_PERSISTENT,
  RQM_DEFAULT_URL,
} from '@nestjs/microservices/constants';
import { RmqUrl } from '@nestjs/microservices/external/rmq-url.interface';
import { RmqRecordSerializer } from '@nestjs/microservices/serializers';

import {
  AmqpConnectionManager,
  ChannelWrapper,
  connect,
} from 'amqp-connection-manager';
import {
  Channel,
  Connection,
  ConsumeMessage,
  Options,
} from 'amqplib';
import { EventEmitter } from 'events';
import {
  firstValueFrom,
  fromEvent,
  merge,
  Observable,
  ReplaySubject,
  tap,
} from 'rxjs';
import {
  first,
  map,
  retryWhen,
  scan,
  skip,
} from 'rxjs/operators';
import {
  REPLY_QUEUE,
  RQM_DEFAULT_EXCHANGE,
  RQM_DEFAULT_EXCHANGE_OPTIONS,
  RQM_DEFAULT_EXCHANGE_TYPE,
} from './constants';
import { ExchangeRmqOptions } from './options';

export interface RmqExchangeOptions {
  options?: ExchangeRmqOptions;
}

export class ClientRMQExchange extends ClientProxy {
  protected readonly logger = new Logger(ClientProxy.name);
  protected connection$!: ReplaySubject<Connection>;
  protected client: AmqpConnectionManager | null = null;
  protected channel: ChannelWrapper | null = null;
  protected urls: string[] | RmqUrl[];
  protected exchange: string;
  protected exchangeType: string;
  protected exchangeOptions: Options.AssertExchange;
  protected responseEmitter!: EventEmitter;
  protected replyQueue: string;
  protected persistent: boolean;
  protected noAssert: boolean;

  constructor(protected readonly options: ExchangeRmqOptions) {
    super();
    this.urls = this.getOptionsProp(this.options, 'urls') ?? [ RQM_DEFAULT_URL ];
    this.exchange = this.getOptionsProp(this.options, 'exchange') ?? RQM_DEFAULT_EXCHANGE;
    this.exchangeOptions = this.getOptionsProp(this.options, 'exchangeOptions') ?? RQM_DEFAULT_EXCHANGE_OPTIONS;
    this.exchangeType = this.getOptionsProp(this.options, 'exchangeType') ?? RQM_DEFAULT_EXCHANGE_TYPE;
    this.replyQueue = this.getOptionsProp(this.options, 'replyQueue') ?? REPLY_QUEUE;
    this.persistent = this.getOptionsProp(this.options, 'persistent') ?? RQM_DEFAULT_PERSISTENT;
    this.noAssert = this.getOptionsProp(this.options, 'noAssert') ?? RQM_DEFAULT_NO_ASSERT;

    this.initializeSerializer(options);
    this.initializeDeserializer(options);
  }

  public isConnected() {
    return this.client && this.client.isConnected();
  }

  public close(): void {
    this.channel && this.channel.close();
    this.client && this.client.close();
    this.channel = null;
    this.client = null;
  }

  public connect(): Promise<Connection> {
    if (this.client) {
      return this.convertConnectionToPromise();
    }
    this.client = this.createClient();
    this.handleError(this.client);
    this.handleDisconnectError(this.client);

    this.responseEmitter = new EventEmitter();
    this.responseEmitter.setMaxListeners(0);

    const connect$ = this.connect$(this.client);
    const withDisconnect$ = this.mergeDisconnectEvent(
      this.client,
      connect$
    ).pipe(
      tap(() => this.createChannel())
    );

    const withReconnect$ = fromEvent(this.client, CONNECT_EVENT).pipe(
      skip(1)
    );
    const source$: Observable<{ url: string, connection: Connection }> = merge(withDisconnect$, withReconnect$);

    this.connection$ = new ReplaySubject(1);
    source$.subscribe({
      next: data => {
        this.connection$.next(data.connection);
      }
    });

    return this.convertConnectionToPromise();
  }

  public createChannel(): Promise<void> {
    return new Promise(resolve => {
      this.channel = this.client!.createChannel({
        json: false,
        setup: (channel: Channel) => this.setupExchange(channel, resolve)
      });
    });
  }

  public createClient(): AmqpConnectionManager {
    const socketOptions = this.getOptionsProp(this.options, 'socketOptions');
    return connect(this.urls, socketOptions);
  }

  public mergeDisconnectEvent<T = any>(
    instance: any,
    source$: Observable<T>
  ): Observable<T> {
    const eventToError = (eventType: string) =>
      fromEvent(instance, eventType).pipe(
        map((err: unknown) => {
          throw err;
        })
      );
    const disconnect$ = eventToError(DISCONNECT_EVENT);

    const urls = this.getOptionsProp(this.options, 'urls', []) ?? [];
    const connectFailed$ = eventToError(CONNECT_FAILED_EVENT).pipe(
      retryWhen(e =>
        e.pipe(
          scan((errorCount, error: any) => {
            if (urls.indexOf(error.url) >= urls.length - 1) {
              throw error;
            }
            return errorCount + 1;
          }, 0)
        )
      )
    );
    // If we ever decide to propagate all disconnect errors & re-emit them through
    // the "connection" stream then comment out "first()" operator.
    return merge(source$, disconnect$, connectFailed$).pipe(first());
  }

  public async convertConnectionToPromise() {
    // try {
      return await firstValueFrom(this.connection$);
    // } catch (err) {
    //   if (err instanceof EmptyError) {
    //     return;
    //   }
    //   throw err;
    // }
  }

  public async setupExchange(channel: Channel, resolve: () => unknown) {
    if (!this.noAssert) {
      await channel.assertExchange(this.exchange, this.exchangeType, this.exchangeOptions);
    }

    await this.consumeChannel(channel);
    resolve();
  }

  public async consumeChannel(channel: Channel) {
    const noAck = this.getOptionsProp(this.options, 'noAck', RQM_DEFAULT_NOACK);
    await channel.consume(
      this.replyQueue,
      (msg: ConsumeMessage | null) => {
        if (msg) {
          this.responseEmitter.emit(msg.properties.correlationId, msg);
        } else {
          this.logger.warn(`Message is empty from RMQ queue ${this.replyQueue}`);
        }
      },
      {
        noAck
      }
    );
  }

  public handleError(client: AmqpConnectionManager): void {
    client.addListener(ERROR_EVENT, (err: any) => this.logger.error(err));
  }

  public handleDisconnectError(client: AmqpConnectionManager): void {
    client.addListener(DISCONNECT_EVENT, (err: any) => {
      this.logger.error(DISCONNECTED_RMQ_MESSAGE);
      this.logger.error(err);
    });
  }

  public async handleMessage(
    packet: unknown,
    callback: (packet: WritePacket) => any
  ): Promise<void>;
  public async handleMessage(
    packet: unknown,
    options: Record<string, unknown>,
    callback: (packet: WritePacket) => any
  ): Promise<void>;
  public async handleMessage(
    packet: unknown,
    optionsOrCallback: Record<string, unknown> | ((packet: WritePacket) => any),
    callback?: (packet: WritePacket) => any
  ): Promise<void> {
    let options: Record<string, unknown> | undefined = undefined;
    if (isFunction(options)) {
      callback = options as (packet: WritePacket) => any;
    } else {
      options = optionsOrCallback as Record<string, unknown>;
    }

    if (!callback) {
      throw new Error('No callback provided');
    }

    const {
      err,
      response,
      isDisposed
    } = await this.deserializer.deserialize(
      packet,
      options
    );
    if (isDisposed || err) {
      callback({
        err,
        response,
        isDisposed: true
      });
    }
    callback({
      err,
      response
    });
  }

  protected publish(
    message: ReadPacket,
    callback: (packet: WritePacket) => any
  ): () => void {
    try {
      const correlationId = randomStringGenerator();
      const listener = ({
        content,
        options
      }: {
        content: Buffer;
        options: Record<string, unknown>;
      }) =>
        this.handleMessage(
          this.parseMessageContent(content),
          options,
          callback
        );

      Object.assign(message, { id: correlationId });
      const serializedPacket: ReadPacket & Partial<RmqRecord> =
        this.serializer.serialize(message);

      const options = serializedPacket.options;
      delete serializedPacket.options;

      this.responseEmitter.on(correlationId, listener);
      this.channel!
        .publish(
          this.exchange,
          serializedPacket.pattern,
          Buffer.from(JSON.stringify(serializedPacket.data)),
          {
            replyTo: this.replyQueue,
            persistent: this.persistent,
            ...options,
            headers: this.mergeHeaders(options?.headers),
            correlationId
          } as Options.Publish
        )
        .catch(err => callback({ err }));
      return () => this.responseEmitter.removeListener(correlationId, listener);
    } catch (err) {
      callback({ err });
    }
    return () => void 0;
  }

  protected dispatchEvent(packet: ReadPacket): Promise<any> {
    const serializedPacket: ReadPacket & Partial<RmqRecord> =
      this.serializer.serialize(packet);

    const options = serializedPacket.options;
    delete serializedPacket.options;

    return new Promise<void>((resolve, reject) =>
      this.channel!.publish(
        this.exchange,
        serializedPacket.pattern,
        Buffer.from(JSON.stringify(serializedPacket.data)),
        {
          persistent: this.persistent,
          ...options,
          headers: this.mergeHeaders(options?.headers)
        } as Options.Publish,
        (err: unknown) => (
          err ? reject(err) : resolve()
        )
      )
    );
  }

  protected override initializeSerializer(options: ExchangeRmqOptions) {
    this.serializer = options?.serializer ?? new RmqRecordSerializer();
  }

  protected mergeHeaders(
    requestHeaders?: Record<string, string>
  ): Record<string, string> | undefined {
    if (!requestHeaders && !this.options?.headers) {
      return undefined;
    }

    return {
      ...this.options?.headers,
      ...requestHeaders
    };
  }

  protected parseMessageContent(content: Buffer) {
    const rawContent = content.toString();
    try {
      return JSON.parse(rawContent);
    } catch {
      return rawContent;
    }
  }
}
