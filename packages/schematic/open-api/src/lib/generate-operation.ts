import {OpenAPIV3} from 'openapi-types';
import {Project} from 'ts-morph';
import {GenerateComponents} from './generate-components';
import {GenerateParameters} from './generate-parameters';
import {GenerateRequestBody} from './generate-request-body';
import {GenerateResponse} from './generate-response';
import {GenerateParameter, GeneratorFunction, HasOperationId, OpenApiSchemaBase, OperationObject} from './types';
import {IgnoreOperation} from './utilities/ignore-operation';
import {IsHttpMethod} from './utilities/is-http-method';
import {IsOperationObject} from './utilities/is-operation-object';

async function executeGenerator<Options extends OpenApiSchemaBase>(
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
    await generatorFunction(parameters);
  } catch (e) {
    console.error(`Failed to generate [${generatorFunction?.name}] for operation: ${operation.operationId}`);
  }
}

export function GenerateOperation<Options extends OpenApiSchemaBase = OpenApiSchemaBase>(
  openapi: OpenAPIV3.Document,
  project: Project,
  options: Options,
  generatorFunctionList: GeneratorFunction<Options>[],
): Promise<any> {
  const components: OpenAPIV3.ComponentsObject = (openapi as any).components ?? (openapi as any).definitions ?? {};

  const promiseList: Array<Promise<void>> = [];

  promiseList.push(...GenerateComponents(components, project));

  for (const [path, methods] of Object.entries(openapi.paths)) {

    if (methods) {

      for (const method of Object.keys(methods).filter(IsHttpMethod)) {

        const operation = methods[method];

        if (IsOperationObject(operation)) {

          if (IgnoreOperation(['hidden'])(operation)) {

            console.log(`Ignore operation '${operation.operationId}'`);

          } else {

            if (HasOperationId(operation)) {

              promiseList.push(GenerateParameters(operation, project, components));
              promiseList.push(GenerateRequestBody(operation, project, components));
              promiseList.push(GenerateResponse(operation, project, components));

              for (const generatorFunction of generatorFunctionList) {

                promiseList.push(executeGenerator(
                  project,
                  options,
                  path,
                  method,
                  generatorFunction,
                  components,
                  operation,
                ));

              }

            } else {
              console.warn('Ensure all operation have a operation id.');
            }

          }

        }

      }

    }

  }

  return Promise.all(promiseList);

}
