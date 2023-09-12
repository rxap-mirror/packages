import { NestApplicationOptions } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SetupSentryLogger } from '@rxap/nest-sentry';
import {
  Monolithic,
  MonolithicBootstrapOptions,
  SetupCookieParser,
  SetupCors,
  SetupHelmet,
  SetupSwagger,
  ValidationPipeSetup,
} from '@rxap/nest-server';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

const options: NestApplicationOptions = {};
const bootstrapOptions: Partial<MonolithicBootstrapOptions> = {
  globalPrefixOptions: {
    exclude: [ '/health(.*)', '/info', '/openapi', '/register' ],
  },
};
const server = new Monolithic<NestApplicationOptions, NestExpressApplication>(
  AppModule,
  environment,
  options,
  bootstrapOptions,
);
server.after(SetupHelmet());
server.after(SetupCookieParser());
server.after(SetupCors());
server.after(SetupSentryLogger());
server.after(ValidationPipeSetup());
server.after(SetupSwagger());
server.bootstrap().catch((e) => console.error('Server bootstrap failed: ' + e.message));
