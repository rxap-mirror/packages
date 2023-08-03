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
import * as Handlebars from 'handlebars';
import { join } from 'path';
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

function getSchematics(context: ExecutorContext): Generator[] {
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
      schema: readJsonFile(join(context.root, projectRoot, config.schema)),
    });
  }
  return schematicList;
}

function getGenerators(context: ExecutorContext) {
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
      schema: readJsonFile(join(context.root, projectRoot, config.schema)),
    });
  }
  const schematicList = getSchematics(context);
  return [ ...generatorList, ...schematicList ];
}

function getBuilders(context: ExecutorContext): Executor[] {
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
      schema: readJsonFile(join(context.root, projectRoot, config.schema)),
    });
  }
  return builderList;
}

function getExecutors(context: ExecutorContext) {
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
      schema: readJsonFile(join(context.root, projectRoot, config.schema)),
    });
  }
  const builderList = getBuilders(context);
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
  const generatorList = getGenerators(context);
  const executorsList = getExecutors(context);
  const peerDependencyList = getPeerDependencyList(context);

  console.log('Input for README.md template ready');

  const readme = template({
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
  });

  console.log('README.md generated');

  writeFileToProjectRoot(context, 'README.md', readme);

  return {
    success: true,
  };
}
