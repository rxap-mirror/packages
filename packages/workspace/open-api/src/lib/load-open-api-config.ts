import {
  TreeAdapter,
  TreeLike,
} from '@rxap/workspace-utilities';
import { OpenAPIV3 } from 'openapi-types';
import { parse } from 'yaml';
import { OpenApiSchema } from './types';
import { HttpRequest } from './utilities/http-request';
import { IsOpenApiSchemaFromPath } from './utilities/is-open-api-schema-from-path';

/**
 * Asynchronously loads an OpenAPI configuration from a specified path or URL.
 *
 * This function attempts to load an OpenAPI document based on the provided `options`. If the `options` specify a `path`,
 * the function checks if the file exists in the provided `host` filesystem-like structure. Depending on the file extension,
 * it parses the file as JSON or YAML to construct the OpenAPI document. If the file does not exist or has an unsupported extension,
 * it throws an error.
 *
 * If the `options` specify a `url`, the function performs an HTTP request to fetch the OpenAPI document.
 *
 * @param host - A `TreeLike` object representing a filesystem-like structure where the OpenAPI file might be located.
 * @param options - An `OpenApiSchema` object containing either a `path` or a `url` from which to load the OpenAPI document.
 * The `path` should be a string pointing to a local file in the `host` structure, and the `url` should be a string URL pointing to a remote OpenAPI document.
 * @returns A Promise that resolves to an `OpenAPIV3.Document` object representing the loaded OpenAPI configuration.
 * @throws {Error} Throws an error if neither a valid `path` nor `url` is provided in `options`, if the specified file does not exist,
 * if the file has an unsupported extension, or if any other loading errors occur.
 */
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
