import { IsReferenceObject } from './utilities/is-reference-object';
import { PARAMETER_BASE_PATH, PARAMETER_FILE_SUFFIX } from './config';
import { OpenAPIV3 } from 'openapi-types';
import { TypescriptInterfaceGenerator } from '@rxap/json-schema-to-typescript';
import { AnySchemaObject } from './utilities/any-schema-object';
import { Project } from 'ts-morph';

export async function GenerateParameters(
  operation: OpenAPIV3.OperationObject,
  project: Project,
  components: OpenAPIV3.ComponentsObject
): Promise<void> {

  if (operation.parameters && operation.parameters.length && operation.operationId) {

    const operationId = operation.operationId;

    const properties: Record<string, OpenAPIV3.SchemaObject | AnySchemaObject | OpenAPIV3.ReferenceObject> = {};
    const required: string[]                                                                               = [];

    if (operation.parameters.some(parameter => IsReferenceObject(parameter))) {
      throw new Error('Reference object are not supported in the parameter definition!');
    }

    for (const parameter of operation.parameters.filter(param => !IsReferenceObject(param) && param.in !== 'header')) {

      if (IsReferenceObject(parameter)) {
        throw new Error('FATAL: Reference object are not supported in the parameter definition!');
      }

      properties[ parameter.name ] = parameter.schema ?? { type: 'any' };

      if (parameter.required) {
        required.push(parameter.name);
      }

    }

    const parametersSchema: OpenAPIV3.SchemaObject = {
      type:       'object',
      properties: properties as any,
      required
    };

    const generator = new TypescriptInterfaceGenerator(
      { ...parametersSchema, components },
      { suffix: PARAMETER_FILE_SUFFIX, basePath: PARAMETER_BASE_PATH },
      project
    );

    console.debug(`Generate parameter interface for: ${operationId}`);

    try {

      await generator.build(operationId);

    } catch (error) {
      console.error(`Failed to generate parameter interface for: ${operationId}`, error.message);
    }

  }

}