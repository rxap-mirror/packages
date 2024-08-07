import { RmqUrl } from '@nestjs/microservices/external/rmq-url.interface';
import { Deserializer } from '@nestjs/microservices/interfaces/deserializer.interface';
import { Serializer } from '@nestjs/microservices/interfaces/serializer.interface';
import { AmqpConnectionManagerOptions } from 'amqp-connection-manager/dist/types/AmqpConnectionManager';
import { Options } from 'amqplib';

export interface BaseRmqOptions {
  urls?: string[] | RmqUrl[];
  prefetchCount?: number;
  isGlobalPrefetchCount?: boolean;
  exchangeOptions?: Options.AssertExchange;
  socketOptions?: AmqpConnectionManagerOptions;
  noAck?: boolean;
  consumerTag?: string;
  serializer?: Serializer;
  deserializer?: Deserializer;
  replyQueue?: string;
  persistent?: boolean;
  headers?: Record<string, string>;
  noAssert?: boolean;
  /**
   * Maximum number of connection attempts.
   * Applies only to the consumer configuration.
   * -1 === infinite
   * @default -1
   */
  maxConnectionAttempts?: number;
}

export interface QueueRmqOptions extends BaseRmqOptions {
  queue?: string;
}

export interface ExchangeRmqOptions extends BaseRmqOptions {
  exchange?: string;
  exchangeType?: string;
}
