import { OpenAPIV3 } from 'openapi-types';

export function IgnoreOperation(tags: string[] = []): (operation: OpenAPIV3.OperationObject) => boolean {
  return operation => {

    if (operation?.tags?.length) {
      return operation.tags.some(tag => tags.includes(tag));
    }

    return false;

  };
}