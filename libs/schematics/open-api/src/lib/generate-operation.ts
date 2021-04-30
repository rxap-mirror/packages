import { OpenAPIV3 } from 'openapi-types';
import { IsHttpMethod } from './utilities/is-http-method';
import { IgnoreOperation } from './utilities/ignore-operation';
import { IsOperationObject } from './utilities/is-operation-object';
import { Project } from 'ts-morph';
import {
  HasOperationId,
  GenerateParameter,
  OpenApiSchemaBase,
  GeneratorFunction
} from './types';
import { GenerateParameters } from './generate-parameters';
import { GenerateRequestBody } from './generate-request-body';
import { GenerateResponse } from './generate-response';
import { GenerateComponents } from './generate-components';

export async function GenerateOperation<Options extends OpenApiSchemaBase = OpenApiSchemaBase>(
  openapi: OpenAPIV3.Document,
  project: Project,
  options: Options,
  generatorFunctionList: GeneratorFunction<Options>[],
) {
  const components: OpenAPIV3.ComponentsObject = (openapi as any).components ?? (openapi as any).definitions ?? {};

  await GenerateComponents(components, project);

  for (const [path, methods] of Object.entries(openapi.paths)) {

    if (methods) {

      for (const method of Object.keys(methods).filter(IsHttpMethod)) {

        const operation = methods[method];

        if (IsOperationObject(operation)) {

          if (IgnoreOperation([ 'hidden' ])(operation)) {

            console.log(`Ignore operation '${operation.operationId}'`);

          } else {

            if (HasOperationId(operation)) {

              await GenerateParameters(operation, project, components);
              await GenerateRequestBody(operation, project, components);
              await GenerateResponse(operation, project, components);

              for (const generatorFunction of generatorFunctionList) {

                try {
                  const parameters: GenerateParameter<Options> = {
                    ...operation,
                    components,
                    method,
                    path,
                    project,
                    options
                  }
                  await generatorFunction(parameters);
                } catch (e) {
                  console.error(`Failed to generate [${generatorFunction}] for operation: ${operation.operationId}`);
                }

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
