import { TypescriptInterfaceGenerator } from '@rxap/json-schema-to-typescript';
import { OpenAPIV3 } from 'openapi-types';
import { Project } from 'ts-morph';

import { COMPONENTS_BASE_PATH } from './config';

async function executeInterfaceBuild(
  components: OpenAPIV3.ComponentsObject,
  project: Project,
  schema: any,
  name: string,
) {

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

    await generator.build(name);

  } catch (error: any) {
    console.error(`Failed to generate response interface for: ${ name }`, error.message);
  }
}

export function GenerateComponents(
  components: OpenAPIV3.ComponentsObject,
  project: Project,
): Array<Promise<void>> {

  const promiseList: Array<Promise<void>> = [];

  if (components.schemas) {
    for (const [ name, schema ] of Object.entries(components.schemas)) {
      promiseList.push(executeInterfaceBuild(components, project, schema, name));
    }
  }

  return promiseList;

}
