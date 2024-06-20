import { TypescriptInterfaceGenerator } from '@rxap/json-schema-to-typescript';
import { OpenAPIV3 } from 'openapi-types';
import { Project } from 'ts-morph';

import { COMPONENTS_BASE_PATH } from './config';

/**
 * Generates TypeScript interfaces for specified components based on the OpenAPI schema.
 *
 * This function initializes a TypeScript interface generator with provided schema and components,
 * then attempts to generate a TypeScript interface synchronously. It logs the process and captures
 * any errors that occur during the generation process.
 *
 * @param {OpenAPIV3.ComponentsObject} components - The components object from the OpenAPI specification
 * which includes definitions of objects used across multiple APIs.
 * @param {Project} project - The project context in which the interfaces are being generated, typically
 * including configuration and environment-specific details.
 * @param {any} schema - The complete schema object of the API from which TypeScript interfaces will be
 * generated. This should comply with the OpenAPI specification.
 * @param {string} name - The name of the component for which the interface is to be generated. This name
 * is used both in logging and as an identifier in the generation process.
 *
 * @remarks
 * The function uses `TypescriptInterfaceGenerator` to handle the interface generation. The generator
 * is configured to include imports and to use a predefined base path for components.
 *
 * @example
 * executeInterfaceBuild(apiComponents, myProject, apiSchema, 'User');
 */
function executeInterfaceBuild(
  components: OpenAPIV3.ComponentsObject,
  project: Project,
  schema: any,
  name: string,
): void {

  const generator = new TypescriptInterfaceGenerator(
    {
      ...schema,
      components,
    },
    {
      basePath: COMPONENTS_BASE_PATH,
      addImports: true,
    },
    project,
  );

  console.debug(`Generate component interface for: ${ name }`);

  try {

    generator.buildSync(name);

  } catch (error: any) {
    console.error(`Failed to generate response interface for: ${ name }`, error.message);
  }
}

/**
 * Processes and generates TypeScript interfaces for the given OpenAPI components within a specified project.
 *
 * This function iterates over the `schemas` property of the provided OpenAPI components object. For each schema,
 * it invokes a function to build and integrate the corresponding TypeScript interface into the given project.
 *
 * @param {OpenAPIV3.ComponentsObject} components - An object containing OpenAPI component definitions, which should include schemas for interface generation.
 * @param {Project} project - The project context where the generated interfaces will be added.
 */
export function GenerateComponents(
  components: OpenAPIV3.ComponentsObject,
  project: Project,
): void {

  if (components.schemas) {
    for (const [ name, schema ] of Object.entries(components.schemas)) {
      executeInterfaceBuild(components, project, schema, name);
    }
  }

}
