import { NestApplicationOptions } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { MonolithicBootstrapOptions, Monolithic, SetupHelmet, SetupCookieParser, SetupCors, ValidationPipeSetup, RegisterToStatusService } from '@rxap/nest-server';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { SetupSentryLogger } from '@rxap/nest-sentry';

const options: NestApplicationOptions = {};
const bootstrapOptions: Partial<MonolithicBootstrapOptions> = {};
const server = new Monolithic<NestApplicationOptions, NestExpressApplication>(AppModule, environment, options, bootstrapOptions);
server.after(SetupHelmet());
server.after(SetupCookieParser());
server.after(SetupCors());
server.after(SetupSentryLogger());
server.after(ValidationPipeSetup());
server.ready(RegisterToStatusService());
server.bootstrap().catch((e) => console.error('Server bootstrap failed: ' + e.message));
