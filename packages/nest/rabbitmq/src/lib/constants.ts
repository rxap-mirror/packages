import { Options } from 'amqplib';

export const REPLY_QUEUE = 'amq.rabbitmq.reply-to';

export const RQM_DEFAULT_EXCHANGE = 'default';
export const RQM_DEFAULT_EXCHANGE_TYPE = 'topic';
export const RQM_DEFAULT_EXCHANGE_OPTIONS: Options.AssertExchange = { durable: false };
