import { InjectionToken } from '@angular/core';
import { SocketIoConfig } from './socket-io.config';

export const RXAP_SOCKET_IO_URL = new InjectionToken<SocketIoConfig>(
  'rxap-socket-io/url',
);

export const RXAP_SOCKET_IO_OPTIONS = new InjectionToken<SocketIoConfig>(
  'rxap-socket-io/options',
);
