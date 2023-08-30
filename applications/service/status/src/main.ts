import {
  HttpStatus,
  NestApplicationOptions,
  ValidationPipe,
} from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { RxapLogger } from '@rxap/nest-logger';
import { SentryLogger } from '@rxap/nest-sentry';
import { Monolithic } from '@rxap/nest-server';
import {
  classTransformOptions,
  ValidationHttpException,
  validatorOptions,
} from '@rxap/nest-utilities';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

const server = new Monolithic<NestApplicationOptions, NestExpressApplication>(
  AppModule,
  environment,
  { bufferLogs: true },
  {
    globalPrefixOptions: {
      exclude: [
        '/health(.*)',
        '/register',
      ],
    },
  },
);

server.after((app, config) => {
  if (config.get('SENTRY_ENABLED')) {
    app.useLogger(app.get(SentryLogger));
  } else {
    app.useLogger(new RxapLogger());
  }
});

server.after((app) =>
  app.enableCors({
    credentials: true,
    origin: true,
  }),
);

server.after((app, config) =>
  app.use(cookieParser(config.get('COOKIE_SECRET'))),
);

/**
 * Note that applying helmet as global or registering it must come before other calls to app.use() or setup functions
 * that may call app.use(). This is due to the way the underlying platform (i.e., Express or Fastify) works, where the
 * order that middleware/routes are defined matters. If you use middleware like helmet or cors after you define a route,
 * then that middleware will not apply to that route, it will only apply to routes defined after the middleware.
 */
server.after(app => app.use(helmet()));

server.after((app) =>
  app.useGlobalPipes(
    new ValidationPipe({
      ...validatorOptions,
      transform: true,
      transformOptions: classTransformOptions,
      enableDebugMessages: !environment.production,
      exceptionFactory: (errors) =>
        new ValidationHttpException(errors, HttpStatus.BAD_REQUEST),
    }),
  ),
);

server
  .bootstrap()
  .catch((e) => console.error('Server bootstrap failed: ' + e.message));
