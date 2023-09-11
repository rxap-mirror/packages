import {
  INestApplication,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DocumentBuilder,
  SwaggerModule,
} from '@nestjs/swagger';
import {
  SwaggerCustomOptions,
  SwaggerDocumentOptions,
} from '@nestjs/swagger/dist/interfaces/index';

export interface SetupSwaggerOptions {
  documentOptions?: SwaggerDocumentOptions;
  swaggerOptions?: SwaggerCustomOptions;
  path?: string;
  builder?: (builder: DocumentBuilder) => DocumentBuilder;
}

export function SetupSwagger({ builder, documentOptions, swaggerOptions, path = 'openapi' }: SetupSwaggerOptions = {}) {

  return (
    app: INestApplication,
    config: ConfigService,
    logger: Logger,
    options: { version: string, publicUrl: string },
  ) => {

    let documentBuilder = new DocumentBuilder()
      .setVersion(options.version)
      .addServer(options.publicUrl);
    if (builder) {
      documentBuilder = builder(documentBuilder);
    }
    const documentConfig = documentBuilder.build();

    const document = SwaggerModule.createDocument(app, documentConfig, documentOptions);

    SwaggerModule.setup(path, app, document, swaggerOptions);

  };

}
