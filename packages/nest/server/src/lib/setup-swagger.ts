import { INestApplication } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';

export interface SetupSwaggerOptions {
  documentOptions?: SwaggerDocumentOptions;
  swaggerOptions?: SwaggerCustomOptions;
  path?: string;
  builder?: (builder: DocumentBuilder) => DocumentBuilder;
}

export function SetupSwagger({ builder, documentOptions, swaggerOptions, path = 'openapi' }: SetupSwaggerOptions = {}) {

  return (
    app: INestApplication,
    config: any,
    logger: any,
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
