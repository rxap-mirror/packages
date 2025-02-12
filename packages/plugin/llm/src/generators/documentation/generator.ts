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
import { cleanupJsDoc } from './utilities/cleanup-js-doc';
import { clearAllJsDocs } from './utilities/clear-all-js-docs';
import { clearJsDoc } from './utilities/clear-js-doc';
import {
  completion,
  CompletionOptions,
} from './utilities/completion';
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
  options?: CompletionOptions;
}

async function generateTsDoc({  context, target, question, node, systemPrompt, options }: GenerateTsDocOptions) {

  // console.log(`${question}`.blue);
  try {
    const jsDoc = await completion(systemPrompt, [ context, target, question ].join('\n\n'), options);

    // console.log(jsDoc.grey);

    clearJsDoc(node);
    addJsDoc(node, cleanupJsDoc(jsDoc));

  } catch (e: any) {
    console.log(`${e.message}`.red, e.stack);
    return false;
  }

  return true;

}

export async function documentationGenerator(
  tree: Tree,
  options: DocumentationGeneratorSchema
) {

  const {model, apiKey, orgId, projectId, baseUrl } = options;

  if (model && !Object.keys(tokenLimits).includes(model)) {
    throw new Error(`The model '${model}' is not supported in the documentation generator`);
  }

  // relative path form the workspace root
  const cwd = relative(tree.root, process.cwd());
  const path = options.path ? join(cwd, options.path) : cwd;

  console.log(`base path: ${path}`.grey);

  const systemPrompt = readFileSync(join(__dirname, 'system-prompts', 'generic.txt'), 'utf-8');

  const operation: AsyncTsMorphTransformCallback = async (project: Project) => {
    const failed: string[] = [];
    for (const sourceFile of project.getSourceFiles()) {
      if (sourceFile.getFilePath().match(/\.(spec|cy|stories|d|test)\.ts$/)) {
        continue;
      }

      console.log(`PROCESS`.grey + ' ' + `${sourceFile.getFilePath()}`.cyan);

      const context = composeContext(sourceFile);

      // console.log('CONTEXT'.bgGreen + '\n' + `${context}`.grey);

      let target = `<sourceFile path="${ sourceFile.getFilePath() }">\n`;
      target += clearAllJsDocs(sourceFile).getFullText();
      target += '</sourceFile>\n';

      // console.log('TARGET'.bgGreen + '\n' + `${target}`.grey);

      for (const functionDeclaration of sourceFile.getFunctions()) {
        console.log(`PROCESS`.grey + ' ' + `function ${functionDeclaration.getName()}`.green);
        const question = `TASK: create the TSDoc documentation for the function \`${functionDeclaration.getName()}\` from the file \`${sourceFile.getFilePath()}\``;
        const success = await generateTsDoc({
          systemPrompt,
          question,
          target,
          context,
          node: functionDeclaration,
          options: { model: model as Model, apiKey, orgId, projectId, baseUrl },
        });
        if (!success) {
          failed.push(`${sourceFile.getFilePath()}#function:${functionDeclaration.getName()}`);
        }
      }

      for (const interfaceDeclaration of sourceFile.getInterfaces()) {
        console.log(`PROCESS`.grey + ' ' + `interface ${interfaceDeclaration.getName()}`.green);
        let question = `TASK: create the TSDoc documentation for the interface \`${interfaceDeclaration.getName()}\` from the file \`${sourceFile.getFilePath()}\``;
        const success = await generateTsDoc({
          systemPrompt,
          question,
          target,
          context,
          node: interfaceDeclaration,
          options: { model: model as Model, apiKey, orgId, projectId, baseUrl },
        });

        if (!success) {
          failed.push(`${sourceFile.getFilePath()}#interface:${interfaceDeclaration.getName()}`);
        }

        for (const method of interfaceDeclaration.getMethods()) {
          console.log(`PROCESS`.grey + ' ' + `method ${interfaceDeclaration.getName()}::${method.getName()}`.green);
          question = `TASK: create the TSDoc documentation for the method \`${method.getName()}\` of interface \`${interfaceDeclaration.getName()}\` from the file \`${sourceFile.getFilePath()}\``;

          const success = await generateTsDoc({
            systemPrompt,
            question,
            target,
            context,
            node: method,
            options: { model: model as Model, apiKey, orgId, projectId, baseUrl },
          });
          if (!success) {
            failed.push(`${sourceFile.getFilePath()}#method:${interfaceDeclaration.getName()}::${method.getName()}`);
          }

        }

        for (const property of interfaceDeclaration.getProperties()) {
          console.log(`PROCESS`.grey + ' ' + `interface ${interfaceDeclaration.getName()}::${property.getName()}`.green);
          question = `TASK: create the TSDoc documentation for the method \`${property.getName()}\` of interface \`${interfaceDeclaration.getName()}\` from the file \`${sourceFile.getFilePath()}\``;

          const success = await generateTsDoc({
            systemPrompt,
            question,
            target,
            context,
            node: property,
            options: { model: model as Model, apiKey, orgId, projectId, baseUrl },
          });
          if (!success) {
            failed.push(`${sourceFile.getFilePath()}#method:${interfaceDeclaration.getName()}::${property.getName()}`);
          }

        }

      }

      for (const typeDeclaration of sourceFile.getTypeAliases()) {
        console.log(`PROCESS`.grey + ' ' + `type ${typeDeclaration.getName()}`.green);
        const question = `TASK: create the TSDoc documentation for the type \`${typeDeclaration.getName()}\` from the file \`${sourceFile.getFilePath()}\``;
        const success = await generateTsDoc({
          systemPrompt,
          question,
          target,
          context,
          node: typeDeclaration,
          options: { model: model as Model, apiKey, orgId, projectId, baseUrl },
        });

        if (!success) {
          failed.push(`${sourceFile.getFilePath()}#type:${typeDeclaration.getName()}`);
        }

      }

      for (const classDeclaration of sourceFile.getClasses()) {
        console.log(`PROCESS`.grey + ' ' + `class ${classDeclaration.getName()}`.green);
        let question = `TASK: create the TSDoc documentation for the class \`${classDeclaration.getName()}\` from the file \`${sourceFile.getFilePath()}\``;

        const success = await generateTsDoc({
          systemPrompt,
          question,
          target,
          context,
          node: classDeclaration,
          options: { model: model as Model, apiKey, orgId, projectId, baseUrl },
        });
        if (!success) {
          failed.push(`${sourceFile.getFilePath()}#class:${classDeclaration.getName()}`);
        }

        for (const method of classDeclaration.getMethods().filter(method => !method.getScope() || method.getScope() === Scope.Public)) {
          console.log(`PROCESS`.grey + ' ' + `method ${classDeclaration.getName()}::${method.getName()}`.green);
          question = `TASK: create the TSDoc documentation for the method \`${method.getName()}\` of class \`${classDeclaration.getName()}\` from the file \`${sourceFile.getFilePath()}\``;

          const success = await generateTsDoc({
            systemPrompt,
            question,
            target,
            context,
            node: method,
            options: { model: model as Model, apiKey, orgId, projectId, baseUrl },
          });
          if (!success) {
            failed.push(`${sourceFile.getFilePath()}#method:${classDeclaration.getName()}::${method.getName()}`);
          }

        }

        for (const property of classDeclaration.getProperties().filter(property => !property.getScope() || property.getScope() === Scope.Public)) {
          console.log(`PROCESS`.grey + ' ' + `method ${classDeclaration.getName()}::${property.getName()}`.green);
          question = `TASK: create the TSDoc documentation for the property \`${property.getName()}\` of class \`${classDeclaration.getName()}\` from the file \`${sourceFile.getFilePath()}\``;

          const success = await generateTsDoc({
            systemPrompt,
            question,
            target,
            context,
            node: property,
            options: { model: model as Model, apiKey, orgId, projectId, baseUrl },
          });
          if (!success) {
            failed.push(`${sourceFile.getFilePath()}#method:${classDeclaration.getName()}::${property.getName()}`);
          }

        }

      }

    }

    if (failed.length > 0) {
      console.log('Some documentation generation failed:'.bgRed);
      console.log(`${failed.map(item => ' - ' + item).join('\n')}`.red);
    }
  };

  await TsMorphTransform(tree, path, operation);

}

export default documentationGenerator;
