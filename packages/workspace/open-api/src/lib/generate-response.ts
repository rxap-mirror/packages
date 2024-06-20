import { TypescriptInterfaceGenerator } from '@rxap/json-schema-to-typescript';
import { OpenAPIV3 } from 'openapi-types';
import { Project } from 'ts-morph';
import {
  RESPONSE_BASE_PATH,
  RESPONSE_FILE_SUFFIX,
} from './config';
import { IsAnySchemaObject } from './utilities/any-schema-object';
import { CreateComponentTypeAliasSourceFile } from './utilities/create-component-type-alias-source-file';
import { GetResponse } from './utilities/get-response';
import {
  IsArrayRefSchemaObject,
  IsRefSchemaObject,
} from './utilities/ref-schema-object';

/**
 * Generates TypeScript interfaces or type aliases for API responses based on the provided OpenAPI operation object.
 * This function determines the appropriate response schema from the operation object and decides whether to generate
 * a new TypeScript interface or to reuse an existing type alias based on the schema's complexity and references.
 *
 * @param operation - The OpenAPI operation object containing the details and specifications of an API operation.
 * @param project - The TypeScript project context where the generated files will be added.
 * @param components - The OpenAPI components object which may contain reusable schemas referenced by the operation.
 *
 * The function performs the following steps:
 * 1. Retrieves the appropriate response schema from the operation object.
 * 2. Checks if the response schema is a simple type, a reference, or an array of references.
 * 3. If the response schema is a reference or an array of references, it logs a debug message and creates a type alias
 * in the project without generating a new interface.
 * 4. If the response schema is neither a reference nor an array of references, it initializes a TypeScript interface
 * generator with the response schema and additional configuration options.
 * 5. Attempts to generate and build the TypeScript interface synchronously. If an error occurs during generation,
 * it logs the error.
 *
 * Note: This function uses console.debug for logging skipped operations and console.error for logging errors during
 * interface generation. It assumes the existence of constants `RESPONSE_BASE_PATH` and `RESPONSE_FILE_SUFFIX` for
 * file path configuration.
 */
export function GenerateResponse(
  operation: OpenAPIV3.OperationObject,
  project: Project,
  components: OpenAPIV3.ComponentsObject,
): void {

  const response = GetResponse(operation);

  if (response && !IsAnySchemaObject(response) && operation.operationId) {
    const operationId = operation.operationId;

    if (IsRefSchemaObject(response) || IsArrayRefSchemaObject(response)) {

      console.debug(`Skip response interface generation for: ${ operationId }`);

      CreateComponentTypeAliasSourceFile(
        project,
        operationId,
        response,
        RESPONSE_BASE_PATH,
        RESPONSE_FILE_SUFFIX,
      );

    } else {

      const generator = new TypescriptInterfaceGenerator(
        {
          ...response,
          components,
        },
        {
          suffix: RESPONSE_FILE_SUFFIX,
          basePath: RESPONSE_BASE_PATH,
          addImports: true,
        },
        project,
      );

      console.debug(`Generate response interface for: ${ operationId }`);

      try {

        generator.buildSync(operationId);

      } catch (error: any) {
        console.error(`Failed to generate response interface for: ${ operationId }`, error.message);
      }

    }

  }

}
