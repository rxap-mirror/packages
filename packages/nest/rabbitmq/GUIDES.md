## ClientRMQExchange

```typescript
import { VaultModule, RabbitmqVaultService } from '@rxap/nest-vault';
import { ClientsModule } from '@nestjs/microservices';
import { ClientRmqExchangeModuleOptionsFactory, RABBITMQ_EXCHANGE } from '@rxap/nest-rabbitmq';
import { Logger, Module } from '@nestjs/common';

@Module({
  imports: [
    VaultModule.register(),
    ClientsModule.registerAsync({
      clients: [
        {
          name: RABBITMQ_EXCHANGE,
          useClass: ClientRmqExchangeModuleOptionsFactory,
          extraProviders: [ RabbitmqVaultService, Logger ]
        }
      ],
      isGlobal: true
    })
  ],
})
export class AppModule { }
```
