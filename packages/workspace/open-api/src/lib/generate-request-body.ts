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

/**
 * Generates TypeScript interfaces or type aliases for the request body of an API operation defined in an OpenAPI specification.
 *
 * This function examines the `operation` object to determine the schema of the request body. Depending on the type of schema
 * (reference, array of references, or a direct schema object), it either generates a type alias directly from the reference
 * or invokes a TypeScript interface generator to create interfaces.
 *
 * If the schema is a reference or an array of references, the function will log a debug message and create a type alias
 * in the specified project directory. If the schema is a direct object, it will use the `TypescriptInterfaceGenerator` to
 * generate and build the interface synchronously, handling any errors that occur during the generation process.
 *
 * @param {OpenAPIV3.OperationObject} operation - The OpenAPI operation object containing the request body definition.
 * @param {Project} project - The TypeScript project where the generated files will be added.
 * @param {OpenAPIV3.ComponentsObject} components - The OpenAPI components object used for resolving `$ref` references within schemas.
 *
 */
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
