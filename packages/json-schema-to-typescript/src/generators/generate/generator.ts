import type { JSONSchema } from '@apidevtools/json-schema-ref-parser';
import { Tree } from '@nx/devkit';
import { TypescriptInterfaceGenerator } from '@rxap/json-schema-to-typescript';
import { camelize } from '@rxap/utilities';
import { GenerateGeneratorSchema } from './schema';

export async function generateGenerator(
  tree: Tree,
  options: GenerateGeneratorSchema
) {
  options.output ??= options.path.replace(/\.json$/, '.d.ts');

  if (!tree.exists(options.path)) {
    throw new Error('The given path does not point to an file');
  }

  const content = tree.read(options.path)!.toString();

  let schema: JSONSchema;

  try {
    schema = JSON.parse(content);
  } catch (e: any) {
    throw new Error(`Unable to parse JSON schema: ${e.message}`);
  }

  const generator = new TypescriptInterfaceGenerator(schema, { suffix: options.suffix });

  const name = camelize(schema.$id || schema.title || 'schema');

  const sourceFile = await generator.build(name);

  console.log(sourceFile.getFullText());

  tree.write(options.output, sourceFile.getFullText());

}

export default generateGenerator;
