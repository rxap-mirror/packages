import { TypescriptInterfaceGenerator } from '@rxap/json-schema-to-typescript';
import { OpenAPIV3 } from 'openapi-types';
import { Project } from 'ts-morph';

import { COMPONENTS_BASE_PATH } from './config';

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
