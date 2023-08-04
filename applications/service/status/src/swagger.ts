import { NestFactory } from '@nestjs/core';
import {
  DocumentBuilder,
  SwaggerModule,
} from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { AppModule } from './app/app.module';

NestFactory.create(AppModule).then(app => {
  const options = new DocumentBuilder().build();
  const document = SwaggerModule.createDocument(app, options);

  const outputPath = join(__dirname, 'openapi.json');
  console.log('write to: ' + outputPath);

  writeFileSync(outputPath, JSON.stringify(document, null, 2));

  return app.close();
}).catch(e => console.error('failed to generate openapi: ' + e.message))
           .then(() => console.log('DONE'));

