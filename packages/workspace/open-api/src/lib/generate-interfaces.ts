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
