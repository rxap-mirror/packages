import { TypescriptInterfaceGenerator } from '@rxap/json-schema-to-typescript';
import { OpenAPIV3 } from 'openapi-types';
import { Project } from 'ts-morph';
import {
  REQUEST_BODY_BASE_PATH,
  REQUEST_BODY_FILE_SUFFIX,
} from './config';
import { IsAnySchemaObject } from './utilities/any-schema-object';
import { GetRequestBody } from './utilities/get-reqeust-body';

export function GenerateRequestBody(
  operation: OpenAPIV3.OperationObject,
  project: Project,
  components: OpenAPIV3.ComponentsObject,
): void {

  const requestBodySchema = GetRequestBody(operation);

  if (requestBodySchema && !IsAnySchemaObject(requestBodySchema) && operation.operationId) {
    const operationId = operation.operationId;

    const generator = new TypescriptInterfaceGenerator(
      {
        ...requestBodySchema,
        components,
      },
      {
        suffix: REQUEST_BODY_FILE_SUFFIX,
        basePath: REQUEST_BODY_BASE_PATH,
        addImports: true,
      },
      project,
    );

    console.debug(`Generate request body interface for: ${ operationId }`);

    try {

      generator.buildSync(operationId);

    } catch (error: any) {
      console.error(`Failed to generate request body interface for: ${ operationId }`, error.message);
    }

  }

}
