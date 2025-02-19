import type { JSONSchema } from '@apidevtools/json-schema-ref-parser';
import { PromiseExecutor } from '@nx/devkit';
import { TypescriptInterfaceGenerator } from '@rxap/json-schema-to-typescript';
import { GetProjectRoot } from '@rxap/plugin-utilities';
import { camelize } from '@rxap/utilities';
import {
  existsSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import { globSync } from 'glob';
import { join } from 'path';
import { GenerateSchemaExecutorSchema } from './schema';

function getSchemaJsonPaths(basePath: string, excludePatterns: string[] = []): string[] {
  excludePatterns.push('**/node_modules/**', '**/dist/**', '**/docs/**', '**/coverage/**');

  // Use glob to find all `schema.json` within the basePath
  const schemas = globSync('**/schema.json', {
    cwd: basePath,
    ignore: excludePatterns,
    nodir: true,
    absolute: false
  });

  // Return the found paths relative to the base path
  return schemas;
}

function isGenerator(path: string): boolean {
  return path.includes('/generators/');
}

function isExecutor(path: string): boolean {
  return path.includes('/executors/');
}

function getSuffix(path: string): string | undefined {
  let suffix: string | undefined = undefined;
  if (isExecutor(path)) {
    suffix = 'Executor';
  }
  if (isGenerator(path)) {
    suffix = 'Generator';
  }
  return suffix;
}

async function generateSchema(schema: JSONSchema, suffix?: string): Promise<string> {
  let name = camelize(schema.$id || schema.title || 'schema');
  if (suffix) {
    if (name.endsWith(suffix)) {
      name = name.replace(new RegExp(`${suffix}$`), '');
    }
    if (name === 'schema') {
      suffix = undefined;
    } else {
      suffix = [suffix, 'Schema'].join('');
    }
  }
  const generator = new TypescriptInterfaceGenerator(schema, { suffix, useStringTuple: true });
  const sourceFile = await generator.build(name);
  return sourceFile.getFullText();
}

function loadSchema(path: string): JSONSchema {

  if (!existsSync(path)) {
    throw new Error(`File ${path} does not exist`);
  }

  const content = readFileSync(path, 'utf-8');

  try {
    return JSON.parse(content);
  } catch (error: any) {
    throw new Error(`${path} failed to parse schema`);
  }

}

const runExecutor: PromiseExecutor<GenerateSchemaExecutorSchema> = async (
  options, context
) => {
  console.log('Executor ran for GenerateSchema', options);

  const projectRoot = GetProjectRoot(context);

  const schemaJsonPaths = getSchemaJsonPaths(projectRoot, options.excludes);

  for (let schemaJsonPath of schemaJsonPaths) {

    schemaJsonPath = join(context.root, projectRoot, schemaJsonPath);

    const suffix = getSuffix(schemaJsonPath);
    const schema = loadSchema(schemaJsonPath);
    const output = await generateSchema(schema, suffix);
    const outputPath = schemaJsonPath.replace(/\.json$/, '.d.ts');
    writeFileSync(outputPath, output);

  }

  return {
    success: true,
  };
};

export default runExecutor;
