import {IsOpenApiSchemaFromPath} from './utilities/is-open-api-schema-from-path';
import {HttpRequest} from './utilities/http-request';
import {OpenAPIV3} from 'openapi-types';
import {Tree} from '@angular-devkit/schematics';
import {OpenApiSchema} from './types';

export async function LoadOpenApiConfig(host: Tree, options: OpenApiSchema): Promise<OpenAPIV3.Document> {
  let openapi: OpenAPIV3.Document;
  if (IsOpenApiSchemaFromPath(options)) {

    if (!host.exists(options.path)) {
      throw new Error('Could not find openapi file.');
    }

    openapi = JSON.parse(host.read(options.path)!.toString('utf-8'));

  } else if (options.url) {

    openapi = await HttpRequest<OpenAPIV3.Document>(options.url);

  } else {
    throw new Error('Either the path or url must be defined');
  }
  return openapi;
}
