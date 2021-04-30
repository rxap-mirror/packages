import { OpenAPIV3 } from 'openapi-types';
import { Project } from 'ts-morph';
import { TypescriptInterfaceGenerator } from '@rxap/json-schema-to-typescript';
import { COMPONENTS_BASE_PATH } from './config';

export async function GenerateComponents(
  components: OpenAPIV3.ComponentsObject,
  project: Project
): Promise<void> {

  if (components.schemas) {
    for (const [ name, schema ] of Object.entries(components.schemas)) {

      const generator = new TypescriptInterfaceGenerator(
        { ...schema, components },
        { basePath: COMPONENTS_BASE_PATH },
        project
      );

      console.debug(`Generate component interface for: ${name}`);

      try {

        await generator.build(name);

      } catch (error) {
        console.error(`Failed to generate response interface for: ${name}`, error.message);
      }

    }
  }

}