import { HealthIndicatorService } from '@nestjs/terminus';
import { ClientRMQExchange } from './client-rmq-exchange';
import { ClientRmqExchangeModuleOptionsFactory } from './client-rmq-exchange-module-options-factory';
import { RabbitmqHealthIndicator } from './rabbitmq.health-indicator';
import { RabbitmqOptionsFactory } from './rabbitmq-options-factory';

const make = <T extends RabbitmqOptionsFactory>(Ctor: new () => T, env: Record<string, any>) => {
  const factory: any = new Ctor();
  factory.config = {
    get: (k: string, d?: any) => env[k] ?? d,
    getOrThrow: (k: string) => {
      if (env[k] === undefined) throw new Error(`missing ${k}`);
      return env[k];
    },
  };
  factory.logger = { debug: jest.fn(), verbose: jest.fn() };
  return factory as T;
};

describe('RabbitmqOptionsFactory', () => {
  const base = { RABBITMQ_HOST: 'h', RABBITMQ_PORT: 5672, RABBITMQ_VHOST: 'v' };

  it('builds a static url when disabled', async () => {
    for (const disabled of [true, 'true']) {
      const f = make(RabbitmqOptionsFactory, { ...base, RABBITMQ_DISABLED: disabled });
      expect(await f.build()).toEqual({
        urls: ['amqp://h:5672/v'],
        socketOptions: { reconnectTimeInSeconds: 86400 },
      });
    }
  });

  it('resolves the url lazily when enabled', async () => {
    const f = make(RabbitmqOptionsFactory, { ...base, RABBITMQ_USERNAME: 'u', RABBITMQ_PASSWORD: 'p' });
    const options: any = await f.build();
    expect(options.urls).toBeUndefined();
    expect(await options.socketOptions.findServers()).toBe('amqp://u:p@h:5672/v');
  });

  it('prefers RABBITMQ_URI', async () => {
    const f = make(RabbitmqOptionsFactory, { RABBITMQ_URI: 'amqp://x' });
    expect(await f.buildUrl()).toBe('amqp://x');
  });

  it('requires credentials', async () => {
    const f = make(RabbitmqOptionsFactory, base);
    expect(await f.getCredentials()).toBeNull();
    await expect(f.buildUrl()).rejects.toThrow('No credentials found');
  });

  it('returns credentials from env', async () => {
    const f = make(RabbitmqOptionsFactory, { RABBITMQ_USERNAME: 'u', RABBITMQ_PASSWORD: 'p' });
    expect(await f.getCredentials()).toEqual({ username: 'u', password: 'p' });
  });
});

describe('ClientRmqExchangeModuleOptionsFactory', () => {
  const env = {
    RABBITMQ_DISABLED: 'true', RABBITMQ_HOST: 'h', RABBITMQ_PORT: 1, RABBITMQ_VHOST: 'v',
    RABBITMQ_EXCHANGE_NAME: 'ex',
  };

  it('uses the configured exchange name and the default type', async () => {
    const f = make(ClientRmqExchangeModuleOptionsFactory, env);
    const o = await f.createClientOptions();
    expect(o.customClass).toBe(ClientRMQExchange);
    expect(o.options.exchange).toEqual({ name: 'ex', type: 'topic' });
    expect(o.options.urls).toEqual(['amqp://h:1/v']);
  });

  it('accepts explicit name and type', async () => {
    const f = make(ClientRmqExchangeModuleOptionsFactory, env);
    expect((await f.createClientOptions('n', 'fanout')).options.exchange).toEqual({ name: 'n', type: 'fanout' });
  });
});

describe('RabbitmqHealthIndicator', () => {
  const make2 = (connected: boolean) => {
    const i: any = new RabbitmqHealthIndicator();
    i.healthIndicatorService = new HealthIndicatorService();
    i.client = { connect: jest.fn(async () => undefined), isConnected: () => connected };
    return i as any;
  };

  it('reports up when connected', async () => {
    const i = make2(true);
    expect(await i.isHealthy()).toEqual({ rabbitmq: { status: 'up' } });
    expect(i.client.connect).toHaveBeenCalled();
  });

  it('reports down when not connected', async () => {
    await expect(make2(false).isHealthy()).resolves.toEqual({
      rabbitmq: { status: 'down', message: 'Connection to RabbitMQ is not established!' },
    });
  });
});
