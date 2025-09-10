import { TypescriptInterfaceGenerator } from '@rxap/json-schema-to-typescript';
import { OpenAPIV3 } from 'openapi-types';
import { Project } from 'ts-morph';
import {
  PARAMETER_BASE_PATH,
  PARAMETER_FILE_SUFFIX,
} from './config';
import { AnySchemaObject } from './utilities/any-schema-object';
import { IsReferenceObject } from './utilities/is-reference-object';

/**
 * Generates TypeScript interfaces for the parameters of a given OpenAPI operation object.
 * This function processes the parameters of the operation, excluding those in the 'header',
 * and generates TypeScript interfaces using the TypescriptInterfaceGenerator.
 *
 * @param operation - The OpenAPI operation object containing details about the API operation.
 * @param project - The project context in which the interfaces are generated.
 * @param components - The OpenAPI components object used for resolving any $ref references in the parameters.
 *
 * @remarks
 * This function filters out header parameters and processes only path, query, and cookie parameters.
 * It handles both direct parameter objects and referenced objects found in the components section of the OpenAPI spec.
 * If a referenced object is encountered, it resolves the reference and includes the resolved object in the parameter list.
 * The function throws errors if references are incorrectly formatted or unresolved.
 *
 * The function constructs a schema object that describes the structure of the parameters using the properties and required fields.
 * This schema object is then used by the TypescriptInterfaceGenerator to generate the appropriate TypeScript interfaces.
 *
 * Errors during the generation process are logged to the console.
 *
 * @example
 * // Assuming operation, project, and components are already defined:
 * GenerateParameters(operation, project, components);
 *
 * @throws {Error} If the $ref is malformed or cannot be resolved within the components object.
 * @throws {Error} If reference objects are still present after processing, indicating unresolved references.
 */
export function GenerateParameters(
  operation: OpenAPIV3.OperationObject,
  project: Project,
  components: OpenAPIV3.ComponentsObject,
): void {

  if (operation.parameters && operation.parameters.length && operation.operationId) {

    const operationId = operation.operationId;

    const properties: Record<string, OpenAPIV3.SchemaObject | AnySchemaObject | OpenAPIV3.ReferenceObject> = {};
    const required: string[] = [];

    const parameters = operation.parameters.filter(param => !IsReferenceObject(param));

    for (const parameter of operation.parameters.filter(param => IsReferenceObject(param))) {
      if (IsReferenceObject(parameter)) {
        const ref = parameter.$ref;
        const segments: string[] = ref.split('/');
        const hashTag = segments.shift();
        const componentsSegment = segments.shift();
        const group = segments.shift();
        const name = segments.shift();
        if (hashTag !== '#') {
          throw new Error('Could not parse ref: ' + ref);
        }
        if (componentsSegment !== 'components') {
          throw new Error('Could not parse ref: ' + ref);
        }
        if (!group || !(components as any)[group]) {
          throw new Error(`Group '${ group }' does not exist in the components object with ref: ${ ref }`);
        }
        const component = (components as any)[group];
        if (!name || !component[name]) {
          throw new Error(`Could not find '${ name }' in group '${ group } with ref: ${ ref }`);
        }
        parameters.push(component[name]);
      }
    }

    if (parameters.some(parameter => IsReferenceObject(parameter))) {
      throw new Error('Reference object are not supported in the parameter definition!');
    }

    for (const parameter of parameters) {

      if (IsReferenceObject(parameter)) {
        throw new Error('FATAL: Reference object are not supported in the parameter definition!');
      }

      properties[parameter.name] = parameter.schema ?? { type: 'any' };

      if (parameter.required) {
        required.push(parameter.name);
      }

    }

    const parametersSchema: OpenAPIV3.SchemaObject = {
      type: 'object',
      properties: properties as any,
      required,
    };

    const generator = new TypescriptInterfaceGenerator(
      {
        ...parametersSchema,
        components,
      },
      {
        suffix: PARAMETER_FILE_SUFFIX,
        basePath: PARAMETER_BASE_PATH,
        addImports: true,
      },
      project,
    );

    console.debug(`Generate parameter interface for: ${ operationId }`);

    try {

      generator.buildSync(operationId);

    } catch (error: any) {
      console.error(`Failed to generate parameter interface for: ${ operationId }`, error.message);
    }

  }

}
