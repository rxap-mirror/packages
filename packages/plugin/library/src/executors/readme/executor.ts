import $RefParser from '@apidevtools/json-schema-ref-parser';
import {
  ExecutorContext,
  readJsonFile,
} from '@nx/devkit';
import {
  GetProjectRoot,
  readFileFromProjectRoot,
  readPackageJsonForProject,
  writeFileToProjectRoot,
} from '@rxap/plugin-utilities';
import {
  deepMerge,
  unique,
} from '@rxap/utilities';
import * as Handlebars from 'handlebars';
import {
  dirname,
  join,
  relative,
} from 'path';
import { ReadmeExecutorSchema } from './schema';

function readGetStartedFile(context: ExecutorContext): string {
  // TODO : support GET_STARTED.md but with an fallback to GETSTARTED.md
  return readFileFromProjectRoot(context, 'GETSTARTED.md');
}

function readGetGuidsFile(context: ExecutorContext): string {
  return readFileFromProjectRoot(context, 'GUIDES.md');
}

function getTemplate(context: ExecutorContext) {
  const readmeTemplateFile = readFileFromProjectRoot(context, 'README.md.handlebars', true);

  return Handlebars.compile(readmeTemplateFile);
}

interface Generator<Schema = unknown> {
  name: string;
  description?: string;
  schema: Schema;
}

interface Executor<Schema = unknown> {
  name: string;
  description?: string;
  schema: Schema;
}

async function normalizeSchema(
  context: ExecutorContext,
  schema: $RefParser.JSONSchema,
  basePath: string,
): Promise<$RefParser.JSONSchema> {

  schema = await $RefParser.bundle(schema, {
    resolve: {
      external: true,
      file: {
        canRead: /schema\.json$/,
        read(
          file: $RefParser.FileInfo,
        ): string {
          // fix the file url. The url is already resolved relative the current cwd.
          // this results in an incorrect path. Eg. $ref: ../init-application/schema.json
          // will be resolved to file.url = /<project-root>/../init-application/schema.json
          // A workaround is need to fix the url to be resolved relative to the schema.json
          // file in the schematic/generator/executor/builder folder
          const restoredRef = relative(context.root, file.url);
          const schemaFilePath = join(basePath, restoredRef);
          return readFileFromProjectRoot(context, schemaFilePath, true);
        },
      },
    },
  });

  if (schema.allOf) {
    schema.properties = {};
    schema.required = [];
    for (const item of schema.allOf) {
      if (typeof item === 'object') {
        schema.properties = deepMerge(schema.properties, item.properties ?? {});
        schema.required = [
          ...schema.required, ...(
            typeof item.required !== 'boolean' ? item.required ?? [] : []
          ),
        ].filter(unique());
      }
    }
  }

  // ensure the property 'properties' is defined
  schema.properties ??= {};

  return schema;
}

async function getSchematics(context: ExecutorContext): Promise<Generator[]> {
  const { schematics } = readPackageJsonForProject(context);
  if (!schematics) {
    return [];
  }
  const projectRoot = GetProjectRoot(context);
  const collectionJson = readJsonFile<{ schematics: Record<string, Generator<string>> }>(join(
    context.root,
    projectRoot,
    schematics,
  ));
  const schematicList: Generator[] = [];
  for (const [ schematic, config ] of Object.entries(collectionJson.schematics ?? {})) {
    schematicList.push({
      name: schematic,
      description: config.description,
      schema: await normalizeSchema(
        context, readJsonFile(join(context.root, projectRoot, config.schema)), dirname(config.schema)),
    });
  }
  return schematicList;
}

async function getGenerators(context: ExecutorContext) {
  const { generators } = readPackageJsonForProject(context);
  if (!generators) {
    return [];
  }
  const projectRoot = GetProjectRoot(context);
  const collectionJson = readJsonFile<{ generators: Record<string, Generator<string>> }>(join(
    context.root,
    projectRoot,
    generators,
  ));
  const generatorList: Generator[] = [];
  for (const [ generator, config ] of Object.entries(collectionJson.generators ?? {})) {
    generatorList.push({
      name: generator,
      description: config.description,
      schema: await normalizeSchema(
        context, readJsonFile(join(context.root, projectRoot, config.schema)), dirname(config.schema)),
    });
  }
  const schematicList = await getSchematics(context);
  return [ ...generatorList, ...schematicList ];
}

async function getBuilders(context: ExecutorContext): Promise<Executor[]> {
  const { builders } = readPackageJsonForProject(context);
  if (!builders) {
    return [];
  }
  const projectRoot = GetProjectRoot(context);
  const buildersJson = readJsonFile<{ builders: Record<string, Generator<string>> }>(join(
    context.root,
    projectRoot,
    builders,
  ));
  const builderList: Executor[] = [];
  for (const [ builder, config ] of Object.entries(buildersJson.builders ?? {})) {
    builderList.push({
      name: builder,
      description: config.description,
      schema: await normalizeSchema(
        context, readJsonFile(join(context.root, projectRoot, config.schema)), dirname(config.schema)),
    });
  }
  return builderList;
}

async function getExecutors(context: ExecutorContext) {
  const { executors } = readPackageJsonForProject(context);
  if (!executors) {
    return [];
  }
  const projectRoot = GetProjectRoot(context);
  const executorsJson = readJsonFile<{ executors: Record<string, Generator<string>> }>(join(
    context.root,
    projectRoot,
    executors,
  ));
  const executorList: Executor[] = [];
  for (const [ executor, config ] of Object.entries(executorsJson.executors ?? {})) {
    executorList.push({
      name: executor,
      description: config.description,
      schema: await normalizeSchema(
        context, readJsonFile(join(context.root, projectRoot, config.schema)), dirname(config.schema)),
    });
  }
  const builderList = await getBuilders(context);
  return [ ...executorList, ...builderList ];
}

function getPeerDependencyList(context: ExecutorContext): Array<{ name: string, version: string }> {
  const packageJson = readPackageJsonForProject(context);
  const peerDependencyList: Array<{ name: string, version: string }> = [];

  for (const [ packageName, version ] of Object.entries(
    packageJson.peerDependencies ?? {},
  )) {
    peerDependencyList.push({
      name: packageName,
      version,
    });
  }
  return peerDependencyList;
}

Handlebars.registerHelper('hasProperties', function (record: Record<string, unknown>, options: any) {
  if (Object.keys(record).length > 0) {
    options.fn(this);
  }
});

export default async function runExecutor(
  options: ReadmeExecutorSchema,
  context: ExecutorContext,
) {

  const getStartedContent = readGetStartedFile(context);
  const guidesContent = readGetGuidsFile(context);
  const packageJson = readPackageJsonForProject(context);
  const template = getTemplate(context);
  const generatorList = await getGenerators(context);
  const executorsList = await getExecutors(context);
  const peerDependencyList = getPeerDependencyList(context);

  console.log('Input for README.md template ready');

  let readme: string;

  const templateContext = {
    packageJson,
    getStartedContent,
    guidesContent,
    generatorList,
    executorsList,
    peerDependencyList,
    hasPeerDependencies: peerDependencyList.length > 0,
    hasGenerators: generatorList.length > 0,
    hasExecutors: executorsList.length > 0,
    hasInitGenerator: generatorList.find((generator) => generator.name === 'init') !== undefined,
    hasConfigGenerator: generatorList.find((generator) => generator.name === 'config') !== undefined,
  };

  try {
    readme = template(templateContext);
  } catch (e: any) {
    console.error(`Error while generating README.md: ${ e.message }`, templateContext);
    return {
      success: false,
    };
  }

  console.log('README.md generated');

  writeFileToProjectRoot(context, 'README.md', readme);

  return {
    success: true,
  };
}
