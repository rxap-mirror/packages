import {
  TreeAdapter,
  TreeLike,
} from '@rxap/workspace-utilities';
import { OpenAPIV3 } from 'openapi-types';
import { OpenApiSchema } from './types';
import { HttpRequest } from './utilities/http-request';
import { IsOpenApiSchemaFromPath } from './utilities/is-open-api-schema-from-path';

export async function LoadOpenApiConfig(host: TreeLike, options: OpenApiSchema): Promise<OpenAPIV3.Document> {
  let openapi: OpenAPIV3.Document;
  if (IsOpenApiSchemaFromPath(options)) {

    if (!host.exists(options.path)) {
      throw new Error('Could not find openapi file.');
    }

    const treeAdapter = new TreeAdapter(host);

    openapi = JSON.parse(treeAdapter.read(options.path)!.toString('utf-8'));

  } else if (options.url) {

    openapi = await HttpRequest<OpenAPIV3.Document>(options.url);

  } else {
    throw new Error('Either the path or url must be defined');
  }
  return openapi;
}
