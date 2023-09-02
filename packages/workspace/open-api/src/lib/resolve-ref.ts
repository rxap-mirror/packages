import { OpenAPIV3 } from 'openapi-types';

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
