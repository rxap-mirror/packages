import { OpenAPIV3 } from 'openapi-types';
import { Project } from 'ts-morph';
import {
  GenerateParameter,
  GeneratorFunction,
  HasOperationId,
  OpenApiSchemaBase,
  OperationObject,
} from './types';
import { IgnoreOperation } from './utilities/ignore-operation';
import { IsHttpMethod } from './utilities/is-http-method';
import { IsOperationObject } from './utilities/is-operation-object';

/**
 * Executes a generator function with the provided parameters to handle OpenAPI operations.
 *
 * This function is designed to execute a specific generator function that processes OpenAPI operations
 * based on the provided project, options, path, method, components, and operation details. It constructs
 * a parameter object that aggregates all these inputs and passes it to the generator function. If the
 * generator function fails, it logs an error message detailing the failure.
 *
 * @param project - The project context in which the generator operates.
 * @param options - Configuration options specific to the generator, constrained by OpenApiSchemaBase.
 * @param path - The API path that is associated with the operation (e.g., '/users/{userId}').
 * @param method - The HTTP method (e.g., 'GET', 'POST') for the operation.
 * @param generatorFunction - The generator function to be executed. It should accept a single argument
 * of type GenerateParameter<Options>.
 * @param components - The OpenAPI components object that may include schemas, responses, parameters, etc.
 * @param operation - The specific OpenAPI operation object that the generator will process.
 *
 * @template Options - A type parameter that extends OpenApiSchemaBase, used to type the options parameter.
 *
 * @throws Will log an error if the generator function throws an exception during execution.
 */
function executeGenerator<Options extends OpenApiSchemaBase>(
  project: Project,
  options: Options,
  path: string,
  method: string,
  generatorFunction: GeneratorFunction<Options>,
  components: OpenAPIV3.ComponentsObject,
  operation: OperationObject,
) {
  try {
    const parameters: GenerateParameter<Options> = {
      ...operation,
      components,
      method,
      path,
      project,
      options,
    };
    generatorFunction(parameters);
  } catch (e: any) {
    console.error(`Failed to generate [${ generatorFunction?.name }] for operation: ${ operation.operationId }: ${ e.message }`);
  }
}

/**
 * Processes and generates operations based on the provided OpenAPI specification.
 *
 * This function iterates over each path and method in the OpenAPI document, executing a list of generator functions
 * for operations that are not marked as 'hidden' and have an operation ID. It handles the generation of API operations
 * by utilizing custom generator functions provided by the user, which can manipulate or utilize the operation data.
 *
 * @param openapi - The OpenAPI version 3 document which contains the API specification.
 * @param project - The project context in which the operations are being generated.
 * @param options - Configuration options specific to the generation process, extending from a base schema.
 * @param generatorFunctionList - An array of generator functions that take the operation data and perform tasks such as code generation.
 *
 * @typeParam Options - A generic type parameter extending from `OpenApiSchemaBase` which dictates the shape of the options parameter.
 *
 * @remarks
 * - The function logs a message for operations marked as 'hidden'.
 * - It warns if an operation does not have an operation ID.
 * - The function assumes the presence of either `components` or `definitions` in the OpenAPI document for schema references.
 * - It filters out non-HTTP methods from the paths object, ensuring that only valid HTTP operations are processed.
 */
export function GenerateOperation<Options extends OpenApiSchemaBase = OpenApiSchemaBase>(
  openapi: OpenAPIV3.Document,
  project: Project,
  options: Options,
  generatorFunctionList: GeneratorFunction<Options>[],
): void {
  const components: OpenAPIV3.ComponentsObject = (openapi as any).components ?? (openapi as any).definitions ?? {};

  for (const [ path, methods ] of Object.entries(openapi.paths)) {

    if (methods) {

      for (const method of Object.keys(methods).filter(IsHttpMethod)) {

        const operation = methods[method];

        if (IsOperationObject(operation)) {

          if (IgnoreOperation([ 'hidden' ])(operation)) {

            console.log(`Ignore operation '${ operation.operationId }'`);

          } else {

            if (HasOperationId(operation)) {

              for (const generatorFunction of generatorFunctionList) {

                executeGenerator(
                  project,
                  options,
                  path,
                  method,
                  generatorFunction,
                  components,
                  operation,
                );

              }

            } else {
              console.warn('Ensure all operation have a operation id.');
            }

          }

        }

      }

    }

  }

}
