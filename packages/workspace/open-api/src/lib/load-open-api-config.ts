import {
  TreeAdapter,
  TreeLike,
} from '@rxap/workspace-utilities';
import { OpenAPIV3 } from 'openapi-types';
import { parse } from 'yaml';
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

    const content = treeAdapter.read(options.path, 'utf-8')!;

    if (options.path.endsWith('.json')) {
      openapi = JSON.parse(content);
    } else if (options.path.endsWith('.yaml') || options.path.endsWith('.yml')) {
      openapi = parse(content);
    } else {
      throw new Error(`Unsupported file extension: ${options.path}`);
    }

  } else if (options.url) {
    openapi = await HttpRequest<OpenAPIV3.Document>(options.url);
  } else {
    throw new Error('Either the path or url must be defined');
  }
  return openapi;
}
