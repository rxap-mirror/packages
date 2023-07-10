import {
  InjectionToken,
  ModuleWithProviders,
  NgModule,
} from '@angular/core';
import { SocketIoConfig } from './socket-io.config';
import { WrappedSocket } from './socket-io.service';

/** Socket factory */
export function SocketFactory(config: SocketIoConfig) {
  return new WrappedSocket(config);
}

export const SOCKET_CONFIG_TOKEN = new InjectionToken<SocketIoConfig>(
  'rxap-socket-io/config',
);

@NgModule({})
export class SocketIoModule {
  static forRoot(config: SocketIoConfig): ModuleWithProviders<SocketIoModule> {
    return {
      ngModule: SocketIoModule,
      providers: [
        {
          provide: SOCKET_CONFIG_TOKEN,
          useValue: config,
        },
        {
          provide: WrappedSocket,
          useFactory: SocketFactory,
          deps: [ SOCKET_CONFIG_TOKEN ],
        },
      ],
    };
  }
}
