import {
  HttpStatus,
  INestApplication,
  Logger,
  ValidationPipe,
  ValidationPipeOptions,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  classTransformOptions,
  Environment,
  ValidationHttpException,
  validatorOptions,
} from '@rxap/nest-utilities';

export interface ValidationPipeSetupOptions {
  validatorPipeOptions?: ValidationPipeOptions;
}

export function ValidationPipeSetup({ validatorPipeOptions }: ValidationPipeSetupOptions = {}) {
  return (
    app: INestApplication,
    config: ConfigService,
    logger: Logger,
    options: any,
    environment: Environment,
  ) => {
    app.useGlobalPipes(
      new ValidationPipe({
        ...validatorOptions,
        transform: true,
        transformOptions: classTransformOptions,
        enableDebugMessages: !environment.production,
        exceptionFactory: (errors) =>
          new ValidationHttpException(errors, HttpStatus.BAD_REQUEST),
        ...validatorPipeOptions,
      }),
    );
  };
}
