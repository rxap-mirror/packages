import { Logger, NotImplementedException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { io } from 'socket.io-client';
import { SocketIoClientProxyService } from './socket-io-client-proxy.service';
import { DisconnectReason, SocketIoClientProvider } from './socket-io-client.provider';
import { SocketIoClientStrategy } from './socket-io-client.strategy';
import { SocketIoClientModule } from './socket-io-client.module';

jest.mock('socket.io-client', () => ({ io: jest.fn() }));

function createSocket() {
  const handlers: Record<string, (...a: any[]) => void> = {};
  const socket: any = {
    handlers,
    on: jest.fn((e: string, h: any) => {
      handlers[e] = h;
      return socket;
    }),
    off: jest.fn(),
    emit: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
  };
  return socket;
}

function createLogger() {
  return { log: jest.fn(), error: jest.fn(), debug: jest.fn(), verbose: jest.fn() };
}

describe('SocketIoClientProvider', () => {
  let provider: SocketIoClientProvider;
  let socket: any;
  let logger: ReturnType<typeof createLogger>;

  beforeEach(() => {
    socket = createSocket();
    (io as jest.Mock).mockReturnValue(socket);
    logger = createLogger();
    provider = new SocketIoClientProvider();
    (provider as any).logger = logger;
    (provider as any).config = { getOrThrow: (k: string) => `cfg-${k}` };
  });

  it('connects lazily once and passes auth header', () => {
    expect(provider.getSocket()).toBe(socket);
    expect(provider.getSocket()).toBe(socket);
    expect(io).toHaveBeenCalledTimes(1);
    expect(io).toHaveBeenCalledWith('cfg-COORDINATOR_SOCKET', {
      transportOptions: { polling: { extraHeaders: { Authorization: 'Bearer cfg-COORDINATOR_JWT' } } },
    });
  });

  it('emits connect state', () => {
    const connected = jest.fn();
    provider.connected$.subscribe(connected);
    provider.getSocket();
    socket.handlers['connect']();
    expect(connected).toHaveBeenCalled();
    expect(provider.isConnected$.value).toBe(true);
    expect(logger.log).toHaveBeenCalledWith('Socket is connected', 'SocketIoClientProvider');
  });

  it('emits disconnect state and reconnects on server disconnect', () => {
    const reasons: DisconnectReason[] = [];
    provider.disconnected$.subscribe((r) => reasons.push(r));
    provider.getSocket();
    socket.handlers['connect']();
    socket.handlers['disconnect'](DisconnectReason.PING_TIMEOUT);
    expect(reasons).toEqual([DisconnectReason.PING_TIMEOUT]);
    expect(provider.isConnected$.value).toBe(false);
    expect(socket.connect).not.toHaveBeenCalled();
    socket.handlers['disconnect'](DisconnectReason.IO_SERVER_DISCONNECT);
    expect(socket.connect).toHaveBeenCalledTimes(1);
  });

  it('logs connection errors', () => {
    provider.getSocket();
    socket.handlers['connect_error']();
    expect(logger.error).toHaveBeenCalledWith('Connection error', 'SocketIoClientProvider');
  });
});

describe('SocketIoClientProxyService', () => {
  let service: SocketIoClientProxyService;
  let socket: any;
  let logger: ReturnType<typeof createLogger>;

  beforeEach(() => {
    socket = createSocket();
    logger = createLogger();
    service = new SocketIoClientProxyService();
    (service as any).logger = logger;
    (service as any).client = { getSocket: jest.fn(() => socket) };
  });

  it('unwrap is not implemented', () => {
    expect(() => service.unwrap()).toThrow(NotImplementedException);
  });

  it('connect fetches the socket', async () => {
    await service.connect();
    expect((service as any).client.getSocket).toHaveBeenCalled();
  });

  it('close disconnects the socket', async () => {
    await service.close();
    expect(socket.disconnect).toHaveBeenCalled();
  });

  it('dispatchEvent emits pattern and data', async () => {
    await service.dispatchEvent({ pattern: 'p', data: { a: 1 } });
    expect(socket.emit).toHaveBeenCalledWith('p', { a: 1 });
  });

  it('publish emits request with a unique event and forwards the response', () => {
    const cb = jest.fn();
    const teardown = service['publish']({ pattern: 'p', data: { a: 1 } }, cb);
    const [pattern, payload] = socket.emit.mock.calls[0];
    expect(pattern).toBe('p');
    expect(payload.data).toEqual({ a: 1 });
    expect(payload.event).toMatch(/^[0-9a-f]{128}$/);
    socket.handlers[payload.event]({ ok: true });
    expect(cb).toHaveBeenCalledWith({ response: { ok: true } });
    teardown();
    expect(socket.off).toHaveBeenCalledWith(payload.event);
  });
});

describe('SocketIoClientStrategy', () => {
  let socket: any;
  let logger: ReturnType<typeof createLogger>;
  let strategy: SocketIoClientStrategy;

  beforeEach(() => {
    socket = createSocket();
    logger = createLogger();
    strategy = new SocketIoClientStrategy(socket, logger as unknown as Logger);
  });

  it('unwrap and on are not implemented', () => {
    expect(() => strategy.unwrap()).toThrow(NotImplementedException);
    expect(() => strategy.on()).toThrow(NotImplementedException);
  });

  it('listen registers handlers and calls back', () => {
    const handler = jest.fn();
    strategy.addHandler('pattern', handler as any);
    const cb = jest.fn();
    strategy.listen(cb);
    expect(cb).toHaveBeenCalled();
    socket.handlers['connect']();
    expect(logger.log).toHaveBeenCalledWith('connected', 'SocketIoClientStrategy');
    socket.handlers['pattern']({ x: 1 });
    expect(handler).toHaveBeenCalledWith({ x: 1 }, socket);
  });

  it('logs error messages', () => {
    strategy.listen(jest.fn());
    socket.handlers['error']({ message: 'boom' });
    expect(logger.error).toHaveBeenCalledWith('boom', 'SocketIoClientStrategy');
    socket.handlers['error']('plain');
    expect(logger.error).toHaveBeenCalledWith('plain');
  });

  it('close disconnects', () => {
    strategy.close();
    expect(socket.disconnect).toHaveBeenCalled();
  });
});

describe('SocketIoClientModule', () => {
  it('provides and exports the provider and proxy', async () => {
    (io as jest.Mock).mockReturnValue(createSocket());
    const ref = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }), SocketIoClientModule],
    }).compile();
    expect(ref.get(SocketIoClientProvider)).toBeInstanceOf(SocketIoClientProvider);
    expect(ref.get(SocketIoClientProxyService)).toBeInstanceOf(SocketIoClientProxyService);
  });
});
