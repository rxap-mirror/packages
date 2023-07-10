import {Global, Logger, Module} from '@nestjs/common';
import {SocketIoClientProxyService} from './socket-io-client-proxy.service';
import {SocketIoClientProvider} from './socket-io-client.provider';

@Global()
@Module({
  providers: [
    SocketIoClientProvider,
    SocketIoClientProxyService,
    Logger,
  ],
  exports: [
    SocketIoClientProvider,
    SocketIoClientProxyService,
  ],
})
export class SocketIoClientModule {
}
