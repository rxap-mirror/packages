import { OpenAPIV3 } from 'openapi-types';
import { TypescriptInterfaceGenerator } from '@rxap/json-schema-to-typescript';
import { IsAnySchemaObject } from './utilities/any-schema-object';
import { REQUEST_BODY_BASE_PATH, REQUEST_BODY_FILE_SUFFIX } from './config';
import { Project } from 'ts-morph';
import { GetRequestBody } from './utilities/get-reqeust-body';

export async function GenerateRequestBody(
  operation: OpenAPIV3.OperationObject,
  project: Project,
  components: OpenAPIV3.ComponentsObject
): Promise<void> {

  const requestBodySchema = GetRequestBody(operation);

  if (!IsAnySchemaObject(requestBodySchema) && operation.operationId) {
    const operationId = operation.operationId;

    const generator = new TypescriptInterfaceGenerator(
      { ...requestBodySchema, components },
      { suffix: REQUEST_BODY_FILE_SUFFIX, basePath: REQUEST_BODY_BASE_PATH },
      project
    );

    console.debug(`Generate request body interface for: ${operationId}`);

    try {

      await generator.build(operationId);

    } catch (error) {
      console.error(`Failed to generate request body interface for: ${operationId}`, error.message);
    }

  }

}