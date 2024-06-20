import { OpenAPIV3 } from 'openapi-types';

/**
 * Resolves JSON Reference (`$ref`) within an OpenAPI specification document to their corresponding schema definitions.
 * This function mutates the original OpenAPI specification object by replacing `$ref` nodes with the actual schema
 * definitions they refer to, if found within the `components/schemas` section of the specification.
 *
 * @param openApiSpec - The OpenAPI specification object (version 3.x) which includes potential `$ref` references and schema definitions.
 * @param node - The current node in the OpenAPI specification object being examined. This can be any part of the specification.
 * @param parent - The parent object of the current node. This is used to replace the reference with the actual schema.
 * @param key - The key in the parent object that corresponds to the current node. This is used to update the parent object with the resolved schema.
 */
export function ResolveRef(openApiSpec: OpenAPIV3.Document, node: any, parent?: any, key?: string) {
  if (typeof node !== 'object' || node === null) {
    return;
  }
  if (node['$ref']) {
    if (node.$ref.startsWith('#/components/schemas')) {
      const name = node.$ref.replace('#/components/schemas/', '');
      if (parent && key && openApiSpec.components?.schemas) {
        parent[key] = openApiSpec.components.schemas[name];
      }
    }
  } else {
    for (const [ k, v ] of Object.entries(node)) {
      ResolveRef(openApiSpec, v, node, k);
    }
  }
}
