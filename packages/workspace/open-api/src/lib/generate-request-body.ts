import { TypescriptInterfaceGenerator } from '@rxap/json-schema-to-typescript';
import { OpenAPIV3 } from 'openapi-types';
import { Project } from 'ts-morph';
import {
  REQUEST_BODY_BASE_PATH,
  REQUEST_BODY_FILE_SUFFIX,
} from './config';
import { IsAnySchemaObject } from './utilities/any-schema-object';
import { CreateComponentTypeAliasSourceFile } from './utilities/create-component-type-alias-source-file';
import { GetRequestBody } from './utilities/get-reqeust-body';
import {
  IsArrayRefSchemaObject,
  IsRefSchemaObject,
} from './utilities/ref-schema-object';

export function GenerateRequestBody(
  operation: OpenAPIV3.OperationObject,
  project: Project,
  components: OpenAPIV3.ComponentsObject,
): void {

  const requestBodySchema = GetRequestBody(operation);

  if (requestBodySchema && !IsAnySchemaObject(requestBodySchema) && operation.operationId) {
    const operationId = operation.operationId;

    if (IsRefSchemaObject(requestBodySchema) || IsArrayRefSchemaObject(requestBodySchema)) {

      console.debug(`Skip request body interface generation for: ${ operationId }`);

      CreateComponentTypeAliasSourceFile(
        project,
        operationId,
        requestBodySchema,
        REQUEST_BODY_BASE_PATH,
        REQUEST_BODY_FILE_SUFFIX,
      );

    } else {

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

}
