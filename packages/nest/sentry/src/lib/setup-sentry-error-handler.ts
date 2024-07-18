import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BaseExceptionFilter,
  HttpAdapterHost,
} from '@nestjs/core';
import * as Sentry from "@sentry/nestjs"

export function SetupSentryErrorHandler() {
  return (app: INestApplication) => {

    const { httpAdapter } = app.get(HttpAdapterHost);
    Sentry.setupNestErrorHandler(app, new BaseExceptionFilter(httpAdapter));

  };
}
