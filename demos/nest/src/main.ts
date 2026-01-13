import { NestApplicationOptions } from '@nestjs/common';
import { RxapLogger } from '@rxap/nest-logger';
import { NestExpressApplication } from '@nestjs/platform-express';
import {
  MonolithicBootstrapOptions,
  Monolithic,
  SetupHelmet,
  SetupCookieParser,
  SetupCors,
  ValidationPipeSetup,
} from '@rxap/nest-server';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { UseSentryLoggerFactory } from '@rxap/nest-sentry';

const options: NestApplicationOptions = {};
const bootstrapOptions: Partial<MonolithicBootstrapOptions> = {};
const server = new Monolithic<
  NestApplicationOptions,
  RxapLogger,
  NestExpressApplication
>(AppModule, environment, options, bootstrapOptions);
server.after(SetupHelmet());
server.after(SetupCookieParser());
server.after(SetupCors());
server.useLogger(UseSentryLoggerFactory());
server.after(ValidationPipeSetup());
server
  .bootstrap()
  .catch((e) =>
    console.error('Server bootstrap failed: ' + e.message, e.stack)
  );
