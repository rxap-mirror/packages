import {TypescriptInterfaceGenerator} from '@rxap/json-schema-to-typescript';
import {OpenAPIV3} from 'openapi-types';
import {Project} from 'ts-morph';
import {RESPONSE_BASE_PATH, RESPONSE_FILE_SUFFIX} from './config';
import {IsAnySchemaObject} from './utilities/any-schema-object';
import {GetResponse} from './utilities/get-response';

export async function GenerateResponse(
  operation: OpenAPIV3.OperationObject,
  project: Project,
  components: OpenAPIV3.ComponentsObject,
): Promise<void> {

  const response = GetResponse(operation);

  if (response && !IsAnySchemaObject(response) && operation.operationId) {
    const operationId = operation.operationId;

    const generator = new TypescriptInterfaceGenerator(
      {...response, components},
      {suffix: RESPONSE_FILE_SUFFIX, basePath: RESPONSE_BASE_PATH, addImports: true},
      project,
    );

    console.debug(`Generate response interface for: ${operationId}`);

    try {

      await generator.build(operationId);

    } catch (error: any) {
      console.error(`Failed to generate response interface for: ${operationId}`, error.message);
    }

  }

}
