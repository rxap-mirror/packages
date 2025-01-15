import {
  Optional,
  Provider,
} from '@angular/core';
import { ConfigService } from '@rxap/config';
import type {
  ManagerOptions,
  SocketOptions,
} from 'socket.io-client';
import { connect } from 'socket.io-client';
import {
  RXAP_SOCKET_IO,
  RXAP_SOCKET_IO_NAMESPACE,
  RXAP_SOCKET_IO_OPTIONS,
  RXAP_SOCKET_IO_URL,
} from './tokens';

export function provideSocketIo(...providers: Provider[]): Provider[] {
  return [
    ...providers,
    {
      provide: RXAP_SOCKET_IO,
      useFactory: (url: string, namespace: string | null, options: Partial<ManagerOptions & SocketOptions> | null) => {
        if (namespace) {
          url = url.replace(/\/$/, '');
          namespace = namespace.replace(/^\//, '');
          url = [url, namespace].join('/');
        }
        return connect(url, options ?? {});
      },
      deps: [
        RXAP_SOCKET_IO_URL,
        [new Optional(), RXAP_SOCKET_IO_NAMESPACE],
        [new Optional(), RXAP_SOCKET_IO_OPTIONS]
      ]
    }
  ];
}

export function withSocketIoUrl(url: string): Provider {
  return {
    provide: RXAP_SOCKET_IO_URL,
    useValue: url
  };
}

export function withSocketIoNamespace(namespace: string): Provider {
  return {
    provide: RXAP_SOCKET_IO_NAMESPACE,
    useValue: namespace
  };
}

export function withSocketIoOptions(options: Partial<ManagerOptions & SocketOptions>): Provider {
  return {
    provide: RXAP_SOCKET_IO_OPTIONS,
    useValue: options
  };
}

export function withDynamicSocketIoUrl(key = 'socket.url'): Provider {
  return {
    provide: RXAP_SOCKET_IO_URL,
    useFactory: (config: ConfigService) => config.getOrThrow(key),
    deps: [ConfigService]
  };
}

export function withDynamicSocketIoNamespace(key = 'socket.namespace'): Provider {
  return {
    provide: RXAP_SOCKET_IO_NAMESPACE,
    useFactory: (config: ConfigService) => config.getOrThrow(key),
    deps: [ConfigService]
  };
}

export function withDynamicSocketIoOptions(key = 'socket.options'): Provider {
  return {
    provide: RXAP_SOCKET_IO_OPTIONS,
    useFactory: (config: ConfigService) => config.get(key, {}),
    deps: [ ConfigService ]
  };
}
