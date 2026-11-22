import { TestBed } from '@angular/core/testing';
import { ConfigService } from '@rxap/config';
import {
  provideSocketIo,
  withDynamicSocketIoNamespace,
  withDynamicSocketIoOptions,
  withDynamicSocketIoUrl,
  withSocketIoNamespace,
  withSocketIoOptions,
  withSocketIoUrl,
} from './provide';
import {
  RXAP_SOCKET_IO,
  RXAP_SOCKET_IO_NAMESPACE,
  RXAP_SOCKET_IO_OPTIONS,
  RXAP_SOCKET_IO_URL,
} from './tokens';

const connect = jest.fn((url: string, opts: unknown) => ({ url, opts }));
jest.mock('socket.io-client', () => ({
  connect: (url: string, opts: unknown) => connect(url, opts),
}));

describe('socket io providers', () => {
  beforeEach(() => connect.mockClear());

  it('connects to the url with empty options', () => {
    TestBed.configureTestingModule({ providers: [provideSocketIo(withSocketIoUrl('http://h'))] });
    expect(TestBed.inject(RXAP_SOCKET_IO)).toEqual({ url: 'http://h', opts: {} });
  });

  it('joins url and namespace and passes options', () => {
    TestBed.configureTestingModule({
      providers: [
        provideSocketIo(
          withSocketIoUrl('http://h/'),
          withSocketIoNamespace('/chat'),
          withSocketIoOptions({ path: '/p' }),
        ),
      ],
    });
    expect(TestBed.inject(RXAP_SOCKET_IO)).toEqual({ url: 'http://h/chat', opts: { path: '/p' } });
  });

  it('simple providers use values', () => {
    expect(withSocketIoUrl('u')).toEqual({ provide: RXAP_SOCKET_IO_URL, useValue: 'u' });
    expect(withSocketIoNamespace('n')).toEqual({ provide: RXAP_SOCKET_IO_NAMESPACE, useValue: 'n' });
    expect(withSocketIoOptions({})).toEqual({ provide: RXAP_SOCKET_IO_OPTIONS, useValue: {} });
  });

  it('dynamic providers read from the ConfigService', () => {
    const config = {
      getOrThrow: jest.fn((k: string) => (k === 'socket.url' ? 'http://dyn' : 'ns')),
      get: jest.fn((_k: string, d: unknown) => ({ ...(d as object), reconnection: false })),
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: ConfigService, useValue: config },
        provideSocketIo(withDynamicSocketIoUrl(), withDynamicSocketIoNamespace(), withDynamicSocketIoOptions()),
      ],
    });
    expect(TestBed.inject(RXAP_SOCKET_IO)).toEqual({
      url: 'http://dyn/ns',
      opts: { reconnection: false },
    });
    expect(config.getOrThrow).toHaveBeenCalledWith('socket.url');
    expect(config.get).toHaveBeenCalledWith('socket.options', {});
  });
});
