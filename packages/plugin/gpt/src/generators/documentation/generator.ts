import {
  getProjects,
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { AddDir } from '@rxap/generator-ts-morph';
import { GetProjectSourceRoot } from '@rxap/generator-utilities';
import {
  existsSync,
  readFileSync,
} from 'fs';
import {
  Configuration,
  ConfigurationParameters,
  OpenAIApi,
} from 'openai';
import { join } from 'path';
import * as process from 'process';
import {
  ClassDeclaration,
  FunctionDeclaration,
  IndentationText,
  JSDocableNode,
  MethodDeclaration,
  Project,
  QuoteKind,
  SourceFile,
} from 'ts-morph';
import { DocumentationGeneratorSchema } from './schema';
import { SimplePrompt } from './simple-prompt';

function getOpenAi(param: Omit<ConfigurationParameters, 'apiKey'> = {}) {

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('Can not find OPENAI_API_KEY environment variable');
  }

  const configuration = new Configuration({
    ...param,
    apiKey: process.env.OPENAI_API_KEY,
  });
  return new OpenAIApi(configuration);

}

function loadSystemPrompt(name: string) {
  const filePath = join(__dirname, 'system-prompts', `${ name }.txt`);
  if (!existsSync(filePath)) {
    throw new Error(`Can not find system prompt file '${ filePath }'`);
  }
  return readFileSync(filePath).toString();
}

const FUNCTION_SYSTEM_PROMPT = loadSystemPrompt('function');
const METHOD_SYSTEM_PROMPT = loadSystemPrompt('method');
const CLASS_SYSTEM_PROMPT = loadSystemPrompt('class');

function hasJsDoc(node: JSDocableNode) {
  return node.getJsDocs().length > 0;
}

async function prompt(options, systemPrompt: string, prompt: string) {

  if (options.offline) {
    return '';
  }

  return SimplePrompt(
    systemPrompt,
    prompt,
    getOpenAi(),
  );
}

function cleanupJsDoc(jsDoc: string) {

  const cleanJsDocArray = jsDoc
    .split('\n')
    .map(line => line
      .trim()
      .replace(/^\/\*\*/, '')
      .replace(/^\s?\*\//, '')
      .replace(/^\s?\*\s?/, '')
      .trim(),
    );

  cleanJsDocArray.pop();

  return cleanJsDocArray.join('\n');

}

function addJsDoc(options: DocumentationGeneratorSchema, node: JSDocableNode, jsDoc: string) {

  if (options.offline) {
    return;
  }

  node.addJsDoc(cleanupJsDoc(jsDoc));
}

async function processMethod(
  options: DocumentationGeneratorSchema,
  project: Project,
  sourceFile: SourceFile,
  methodDeclaration: MethodDeclaration,
) {

  console.log(`====== Process method: \x1b[36m${ methodDeclaration.getName() }\x1b[0m`);

  if (hasJsDoc(methodDeclaration)) {
    console.log(`\x1b[33mMethod has already a documentation\x1b[0m`);
    return false;
  }

  const methodText = methodDeclaration.getText();

  console.log('Method text:');
  console.log(methodText);


  const jsDoc = await prompt(
    options,
    METHOD_SYSTEM_PROMPT,
    methodText,
  );

  console.log('Method documentation:');
  console.log(jsDoc);

  addJsDoc(options, methodDeclaration, jsDoc);

  return true;

}

async function processClass(
  options: DocumentationGeneratorSchema,
  project: Project,
  sourceFile: SourceFile,
  classDeclaration: ClassDeclaration,
) {

  console.log(`====== Process class: \x1b[36m${ classDeclaration.getName() }\x1b[0m`);

  let changed = false;

  for (const md of classDeclaration.getMethods()) {
    const scope = md.getScope();
    if (scope === 'public' || scope === undefined) {
      const hasChanged = await processMethod(options, project, sourceFile, md);
      changed = changed || hasChanged;
    }
  }

  return changed;

}

async function processFunction(
  options: DocumentationGeneratorSchema,
  project: Project,
  sourceFile: SourceFile,
  functionDeclaration: FunctionDeclaration,
) {

  console.log(`====== Process function: \x1b[36m${ functionDeclaration.getName() }\x1b[0m`);

  if (hasJsDoc(functionDeclaration)) {
    console.log(`\x1b[33mFunction has already a documentation\x1b[0m`);
    return false;
  }

  const functionText = functionDeclaration.getText();

  console.log('Function text:');
  console.log(functionText);

  const jsDoc = await prompt(
    options,
    FUNCTION_SYSTEM_PROMPT,
    functionText,
  );

  console.log('Function documentation:');
  console.log(jsDoc);

  addJsDoc(options, functionDeclaration, jsDoc);

  return true;

}

async function processSourceFile(options: DocumentationGeneratorSchema, project: Project, sourceFile: SourceFile) {

  console.log(`====== Process source file: \x1b[35m${ sourceFile.getFilePath() }\x1b[0m`);

  let changed = false;

  for (const fd of sourceFile.getFunctions()) {
    const hasChanged = await processFunction(options, project, sourceFile, fd);
    changed = changed || hasChanged;
  }

  for (const cd of sourceFile.getClasses()) {
    const hasChanged = await processClass(options, project, sourceFile, cd);
    changed = changed || hasChanged;
  }

  return changed;

}

function skipSourceFile(sourceFile: SourceFile, filter?: string) {
  if (sourceFile.getBaseName() === 'index.ts') {
    // console.log(`\x1b[33mSkip index file: \x1b[0m${ sourceFile.getFilePath() }`);
    return true;
  }
  if (sourceFile.getBaseName().endsWith('.spec.ts')) {
    // console.log(`\x1b[33mSkip spec file: \x1b[0m${ sourceFile.getFilePath() }`);
    return true;
  }
  if (sourceFile.getBaseName().endsWith('.stories.ts')) {
    // console.log(`\x1b[33mSkip stories file: \x1b[0m${ sourceFile.getFilePath() }`);
    return true;
  }
  if (sourceFile.getBaseName().endsWith('.cy.ts')) {
    // console.log(`\x1b[33mSkip cypress file: \x1b[0m${ sourceFile.getFilePath() }`);
    return true;
  }
  if (filter) {
    if (!sourceFile.getFilePath().includes(filter)) {
      // console.log(`\x1b[33mSkip file: \x1b[0m${ sourceFile.getFilePath() }`);
      return true;
    }
  }
  return false;
}

async function processProject(options: DocumentationGeneratorSchema, projectName: string, tree: Tree) {

  const projectSourceRoot = GetProjectSourceRoot(tree, projectName);

  const project = new Project({
    manipulationSettings: {
      indentationText: IndentationText.TwoSpaces,
      quoteKind: QuoteKind.Single,
    },
    useInMemoryFileSystem: true,
  });

  AddDir(tree, projectSourceRoot, project);

  const start = Date.now();

  for (const sourceFile of project.getSourceFiles()) {
    if (skipSourceFile(sourceFile, options.filter)) {
      continue;
    }
    try {
      const changed = await processSourceFile(options, project, sourceFile);
      if (changed) {
        tree.write(join(projectSourceRoot, sourceFile.getFilePath()), sourceFile.getFullText());
      }
    } catch (e: any) {
      console.error(`\x1b[31mError processing file: \x1b[0m${ sourceFile.getFilePath() }`);
      console.error(e.message);
      console.error(e.stack);
      break;
    }
    if (Date.now() - start > MAX_TIME) {
      console.log(`\x1b[33mMax time reached: \x1b[0m${ MAX_TIME }`);
      break;
    }
  }

}

function skipProject(project: ProjectConfiguration, projectName: string, options: DocumentationGeneratorSchema) {

  if (options.projects?.length) {
    return !options.projects.includes(projectName);
  }

  return false;

}

const MAX_TIME = 1000 * 60 * 60 * 0.5;

export async function documentationGenerator(
  tree: Tree,
  options: DocumentationGeneratorSchema,
) {

  if (options.openaiApiKey) {
    process.env.OPENAI_API_KEY = options.openaiApiKey;
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('Can not find OPENAI_API_KEY environment variable');
  }

  console.log(`\x1b[33mOpenAI API key: \x1b[0m${ process.env.OPENAI_API_KEY }`);

  for (const [ projectName, project ] of getProjects(tree).entries()) {

    if (skipProject(project, projectName, options)) {
      continue;
    }

    await processProject(options, projectName, tree);

  }

}

export default documentationGenerator;
