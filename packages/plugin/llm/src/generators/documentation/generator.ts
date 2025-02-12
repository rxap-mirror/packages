import { Tree } from '@nx/devkit';
import {
  AsyncTsMorphTransformCallback,
  TsMorphTransform,
} from '@rxap/workspace-ts-morph';
import { readFileSync } from 'node:fs';
import { relative } from 'node:path';
import { join } from 'path';
import {
  JSDocableNode,
  Project,
  Scope,
} from 'ts-morph';
import { DocumentationGeneratorSchema } from './schema';
import { addJsDoc } from './utilities/add-js-doc';
import { clearJsDoc } from './utilities/clear-js-doc';
import { completion } from './utilities/completion';
import { composeContext } from './utilities/compose-context';
import {
  Model,
  tokenLimits,
} from './utilities/model';

interface GenerateTsDocOptions {
  question: string;
  context: string;
  target: string;
  node: JSDocableNode;
  systemPrompt: string;
  model?: string;
}

async function generateTsDoc({  context, target, question, node, systemPrompt, model }: GenerateTsDocOptions) {

  console.log(question);
  try {
    const jsDoc = await completion(systemPrompt, [ context, target, question ].join('\n\n'), { model: model as Model });

    console.log('jsDoc', jsDoc);

    clearJsDoc(node);
    addJsDoc(node, jsDoc);

  } catch (e: any) {
    console.log(`jsDoc prompt error: ${e.message}`.red);
  }

}

export async function documentationGenerator(
  tree: Tree,
  options: DocumentationGeneratorSchema
) {

  const model = options.model;

  if (model && !Object.keys(tokenLimits).includes(model)) {
    throw new Error(`The model '${model}' is not supported in the documentation generator`);
  }

  // relative path form the workspace root
  const cwd = relative(tree.root, process.cwd());
  const path = options.path ? join(cwd, options.path) : cwd;

  const systemPrompt = readFileSync(join(__dirname, 'system-prompts', 'generic.txt'), 'utf-8');

  const operation: AsyncTsMorphTransformCallback = async (project: Project) => {
    for (const sourceFile of project.getSourceFiles()) {

      const context = composeContext(sourceFile);

      let target = `<sourceFile path="${ sourceFile.getFilePath() }">\n`;
      target += sourceFile.getText({ trimLeadingIndentation: true, includeJsDocComments: false });
      target += '</sourceFile>\n';

      for (const functionDeclaration of sourceFile.getFunctions()) {
        const question = `TASK: create the TSDoc documentation for the function \`${functionDeclaration.getName()}\` from the file \`${sourceFile.getFilePath()}\``;
        await generateTsDoc({
          systemPrompt,
          question,
          target,
          context,
          node: functionDeclaration,
          model
        });
      }

      for (const classDeclaration of sourceFile.getClasses()) {
        let question = `TASK: create the TSDoc documentation for the class \`${classDeclaration.getName()}\` from the file \`${sourceFile.getFilePath()}\``;

        await generateTsDoc({
          systemPrompt,
          question,
          target,
          context,
          node: classDeclaration,
          model
        });

        for (const method of classDeclaration.getMethods().filter(method => !method.getScope() || method.getScope() === Scope.Public)) {
          question = `TASK: create the TSDoc documentation for the method \`${method.getName()}\` of class \`${classDeclaration.getName()}\` from the file \`${sourceFile.getFilePath()}\``;

          await generateTsDoc({
            systemPrompt,
            question,
            target,
            context,
            node: method,
            model
          });

        }

        for (const property of classDeclaration.getProperties().filter(property => !property.getScope() || property.getScope() === Scope.Public)) {
          question = `TASK: create the TSDoc documentation for the property \`${property.getName()}\` of class \`${classDeclaration.getName()}\` from the file \`${sourceFile.getFilePath()}\``;

          await generateTsDoc({
            systemPrompt,
            question,
            target,
            context,
            node: property,
            model
          });

        }

      }

    }
  };

  await TsMorphTransform(tree, path, operation);

}

export default documentationGenerator;
