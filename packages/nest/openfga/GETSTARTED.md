Here’s a simple guide to get you started using the core features of the @rxap/nest-openfga package.

## Overview

• The OpenFgaModule configures and provides access to the OpenFgaService.  
• The OpenFgaService is an injectable instance of the official client from @openfga/sdk.  
• You can register the module either synchronously or asynchronously (for example, when loading from environment variables).  
• The OpenFgaGuard and @OpenFGA() decorator let you protect routes in your NestJS application with Fine-Grained Authorization (FGA) checks.

---

## 1. Registering the Module

### Synchronous Registration

If you have all your configuration available at the time of module initialization, you can directly register the module with static options:

```typescript
import { Module } from '@nestjs/common';
import { OpenFgaModule } from '@rxap/nest-openfga';

@Module({
  imports: [
    OpenFgaModule.register({
      // Use your own FGA configuration here
      apiUrl: 'https://<your-fga-endpoint>',
      storeId: '<your-store-id>',
      authorizationModelId: '<your-auth-model-id>',
      credentials: {
        method: 'api_token',
        config: {
          token: '<YOUR-API-TOKEN>'
        }
      }
    }),
    // ... other imports
  ],
})
export class AppModule {}
```

### Asynchronous Registration

If you read configuration from environment variables or need additional async logic, you can use the async registration. For instance, using the NestJS ConfigService:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OpenFgaModule } from '@rxap/nest-openfga';

@Module({
  imports: [
    ConfigModule.forRoot(),
    OpenFgaModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        apiUrl: configService.get<string>('FGA_API_URL'),
        storeId: configService.get<string>('FGA_STORE_ID'),
        authorizationModelId: configService.get<string>('FGA_AUTHORIZATION_MODEL_ID'),
        credentials: {
          method: 'api_token',
          config: {
            token: configService.get<string>('FGA_API_TOKEN'),
          },
        },
      }),
      inject: [ConfigService],
    }),
    // ... other imports
  ],
})
export class AppModule {}
```

#### Module Options Factory

For quick setup use the `OpenFgaModuleOptionsFactory` class. If used ensure the environment variable `FGA_API_URL` is defined and loaded by the `ConfigService`.


```typescript
import { Module } from '@nestjs/common';
import { OpenFgaModule, OpenFgaModuleOptionsFactory } from '@rxap/nest-openfga';

@Module({
  imports: [
    ConfigModule.forRoot(),
    OpenFgaModule.registerAsync({
      useClass: OpenFgaModuleOptionsFactory,
    }),
    // ... other imports
  ],
})
export class AppModule {}
```

---

## 2. Accessing the OpenFgaService

Once the module is registered, you can inject the OpenFgaService in your providers, controllers, or anywhere else you need to use OpenFGA’s official client methods:

```typescript
import { Controller, Get } from '@nestjs/common';
import { OpenFgaService } from '@rxap/nest-openfga';

@Controller('example')
export class ExampleController {
  constructor(private readonly openFga: OpenFgaService) {}

  @Get()
  async getSomething() {
    // You have full access to the official OpenFgaClient methods here
    const checkResponse = await this.openFga.check({
      tuple_key: {
        user: 'user:123',
        relation: 'view',
        object: 'document:456',
      },
    });
    return { allowed: checkResponse.allowed };
  }
}
```

---

## 3. Securing Routes with OpenFgaGuard and @OpenFGA

### Add the Guard to Your Routes

To protect a specific route, apply the guard at either the controller or method level. This ensures that any request passing through that route must satisfy the guard’s FGA checks.

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { OpenFgaGuard } from '@rxap/nest-openfga';

@Controller('secure')
@UseGuards(OpenFgaGuard)
export class SecureController {
  @Get('data')
  getSecureData() {
    return { message: 'This route is protected by OpenFgaGuard!' };
  }
}
```

### Define the Checks with @OpenFGA

Use the @OpenFGA() decorator to specify the Fine-Grained Authorization checks. You can write static rules or dynamic checks based on the incoming request. Each check describes the user, relation, and object to verify against your FGA store.

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { OpenFgaGuard, OpenFGA } from '@rxap/nest-openfga';

@Controller('fga-example')
@UseGuards(OpenFgaGuard)
export class FgaExampleController {
  @Get()
  @OpenFGA({
    relation: 'view',
    object: ['document', '123'],  // "document:123"
  })
  getAccess() {
    return { message: 'You have permission to view document:123' };
  }
}
```

In this example:
- user is `user:${req.user.sub}`
- relation is `view`  
- object is defined as `document:123`

> If the request does not have a property `user` with the property `sub` the fallback value is `*`

When this route is called, the guard will run the check before allowing the request to proceed.

---

## Summary

1. Import and register the OpenFgaModule (either synchronously or asynchronously).
2. Inject the resulting OpenFgaService wherever you need to make FGA checks.
3. Protect routes with the OpenFgaGuard.
4. Define fine-grained checks using the @OpenFGA() decorator.

With this setup, you can leverage the flexibility of OpenFGA’s authorization model directly inside your NestJS application. This guide should help you quickly integrate @rxap/nest-openfga to secure your routes with dynamic or static permissions. If you have environment-specific configuration, make sure to use the async registration to load everything via NestJS ConfigService.

Happy coding!
