import { InjectionToken } from '@angular/core';
import type {
  ManagerOptions,
  SocketOptions,
  Socket
} from 'socket.io-client';

export const RXAP_SOCKET_IO_URL = new InjectionToken<string>(
  'rxap-socket-io/url',
);

export const RXAP_SOCKET_IO_NAMESPACE = new InjectionToken<string>(
  'rxap-socket-io/namespace',
);

export const RXAP_SOCKET_IO_OPTIONS = new InjectionToken<Partial<ManagerOptions & SocketOptions>>(
  'rxap-socket-io/options',
);

export const RXAP_SOCKET_IO = new InjectionToken<Socket>('rxap-socket-io/instance');
