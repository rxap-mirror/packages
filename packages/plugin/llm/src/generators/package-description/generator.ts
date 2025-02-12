import { Tree } from '@nx/devkit';
import {
  TsMorphTransform,
  TsMorphTransformCallback,
} from '@rxap/workspace-ts-morph';
import {
  GetProjectPackageJson,
  GetProjectSourceRoot,
  UpdateProjectPackageJson,
} from '@rxap/workspace-utilities';
import { readFileSync } from 'node:fs';
import { join } from 'path';
import { Project } from 'ts-morph';
import { Builder } from 'xml2js';
import { completion } from '../../lib/completion';
import {
  ContextSourceFile,
  sourceFileToContextSourceFile,
} from '../../lib/compose-context';
import {
  Model,
  tokenLimits,
} from '../../lib/model';
import { PackageDescriptionGeneratorSchema } from './schema';

function projectToContext(project: Project, packageName: string) {
  const builder = new Builder();
  const context = { sourceFile: [] as ContextSourceFile[], package: { _: packageName } };
  for (const sourceFile of project.getSourceFiles()) {
    context.sourceFile.push(sourceFileToContextSourceFile(sourceFile));
  }
  return builder.buildObject(context).replace(/root>/g, 'context>') + '\n';
}

export async function packageDescriptionGenerator(
  tree: Tree,
  options: PackageDescriptionGeneratorSchema
) {
  const {model = 'gemini/2.0-flash', apiKey, orgId, projectId, baseUrl, project: projectName } = options;

  if (model && !Object.keys(tokenLimits).includes(model)) {
    throw new Error(`The model '${model}' is not supported in the documentation generator`);
  }

  const systemPrompt = readFileSync(join(__dirname, 'system-prompts', 'generic.txt'), 'utf-8');
  let context = '';

  TsMorphTransform(tree, GetProjectSourceRoot(tree, projectName), (project: Project) => {
    context = projectToContext(project, GetProjectPackageJson(tree, projectName).name);
  });

  const description = await completion(systemPrompt, context, { apiKey, projectId, orgId, baseUrl, model: model as Model });

  console.log('DESCRIPTION'.green + ' ' + description);

  UpdateProjectPackageJson(tree, packageJson => {
    packageJson.description = description;
  }, { projectName });

}

export default packageDescriptionGenerator;
