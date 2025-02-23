This package provides a NestJS module for integrating with RabbitMQ using exchanges. It offers a client and server implementation for message queuing and supports features like health checks and error serialization. It simplifies the process of setting up and managing RabbitMQ connections and message handling within NestJS applications.

[![npm version](https://img.shields.io/npm/v/@rxap/nest-rabbitmq?style=flat-square)](https://www.npmjs.com/package/@rxap/nest-rabbitmq)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/nest-rabbitmq)
![npm](https://img.shields.io/npm/dm/@rxap/nest-rabbitmq)
![NPM](https://img.shields.io/npm/l/@rxap/nest-rabbitmq)

- [Installation](#installation)
- [Guides](#guides)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/nest-rabbitmq
```
**Install peer dependencies:**
```bash
yarn add @nestjs/common@^10.3.8 @nestjs/config@^3.2.2 @nestjs/microservices@^10.3.8 @nestjs/terminus@^10.2.3 @rxap/utilities@^16.4.3-dev.2 amqp-connection-manager@^4.1.14 amqplib@^0.10.4 rxjs@^7.8.1 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/nest-rabbitmq:init
```
# Guides

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

# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/nest-rabbitmq:init
```
