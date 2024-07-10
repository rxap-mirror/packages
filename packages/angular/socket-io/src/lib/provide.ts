import { Provider } from '@angular/core';
import { ConfigService } from '@rxap/config';
import { SocketIoOptions } from './socket-io.config';
import {
  WrappedSocket,
} from './socket-io.service';
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
      useFactory: (config: ConfigService) => config.getOrThrow(urlKey),
      deps: [ ConfigService ]
    },
    {
      provide: RXAP_SOCKET_IO_OPTIONS,
      useFactory: (config: ConfigService) => config.get(optionsKey, {}),
      deps: [ ConfigService ]
    },
    WrappedSocket
  ];
}
