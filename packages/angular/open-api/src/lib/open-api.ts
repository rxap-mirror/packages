import { OpenAPIV3 } from 'openapi-types';

export interface OperationObjectWithMetadata extends OpenAPIV3.OperationObject {
  path: string;
  method: string;
}
