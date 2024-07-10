import { Provider } from '@angular/core';
import { ConfigService } from '@rxap/config';
import {
  SocketIoOptions,
  WrappedSocket,
} from '@rxap/socket-io';
import {
  RXAP_SOCKET_IO_OPTIONS,
  RXAP_SOCKET_IO_URL,
} from './tokens';

export function provideSocketIo(url: string, options: SocketIoOptions = {}): Provider[] {
  return [
    {
      provide: RXAP_SOCKET_IO_URL,
      useValue: url,
    },
    {
      provide: RXAP_SOCKET_IO_OPTIONS,
      useValue: options,
    },
    WrappedSocket
  ];
}

export function provideSocketIoFromConfig(urlKey = 'socket.url', optionsKey = 'socket.options'): Provider[] {
  return [
    {
      provide: RXAP_SOCKET_IO_URL,
      useFactory: (config: ConfigService) => config.getOrThrow(urlKey)
    },
    {
      provide: RXAP_SOCKET_IO_OPTIONS,
      useFactory: (config: ConfigService) => config.get(optionsKey, {})
    },
    WrappedSocket
  ];
}
