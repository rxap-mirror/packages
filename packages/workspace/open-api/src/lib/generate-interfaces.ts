import { OpenAPIV3 } from 'openapi-types';
import { Project } from 'ts-morph';
import { GenerateComponents } from './generate-components';
import { GenerateParameters } from './generate-parameters';
import { GenerateRequestBody } from './generate-request-body';
import { GenerateResponse } from './generate-response';
import { HasOperationId } from './types';
import { IgnoreOperation } from './utilities/ignore-operation';
import { IsHttpMethod } from './utilities/is-http-method';
import { IsOperationObject } from './utilities/is-operation-object';

/**
 * Generates TypeScript interfaces for a given OpenAPI 3.0 document within a specified project context.
 * This function processes both the components and paths defined in the OpenAPI document to create corresponding TypeScript interfaces.
 *
 * @param openapi - The OpenAPI 3.0 document object which includes the API specification.
 * @param project - The project context where the generated interfaces will be used or stored.
 *
 * The function performs the following steps:
 * 1. Extracts the components object from the OpenAPI document. If not present, it attempts to retrieve the deprecated 'definitions' object, defaulting to an empty object if neither are available.
 * 2. Invokes `GenerateComponents` to create interfaces for the components (schemas) defined in the OpenAPI document.
 * 3. Iterates over each path in the OpenAPI document. For each path, it processes the HTTP methods associated with it.
 * 4. For each method, it checks if the operation should be ignored based on custom criteria (e.g., tagged as 'hidden').
 * 5. If the operation is not ignored and has an operation ID, it generates TypeScript interfaces for the parameters, request body, and responses of the operation using respective generator functions.
 * 6. Logs a warning if an operation lacks an operation ID, which is essential for generating accurate and meaningful interfaces.
 *
 * Note: This function directly logs to the console for operations that are ignored or lack an operation ID, which might be used for debugging or informational purposes.
 */
export function GenerateInterfaces(
  openapi: OpenAPIV3.Document,
  project: Project,
): void {
  const components: OpenAPIV3.ComponentsObject = (openapi as any).components ?? (openapi as any).definitions ?? {};

  GenerateComponents(components, project);

  for (const [ path, methods ] of Object.entries(openapi.paths)) {

    if (methods) {

      for (const method of Object.keys(methods).filter(IsHttpMethod)) {

        const operation = methods[method];

        if (IsOperationObject(operation)) {

          if (IgnoreOperation([ 'hidden' ])(operation)) {

            console.log(`Ignore operation '${ operation.operationId }'`);

          } else {

            if (HasOperationId(operation)) {

              GenerateParameters(operation, project, components);
              GenerateRequestBody(operation, project, components);
              GenerateResponse(operation, project, components);

            } else {
              console.warn('Ensure all operation have a operation id.');
            }

          }

        }

      }

    }

  }

}
