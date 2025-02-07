import {
  getProjects,
  ProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { TsMorphTransform } from '@rxap/workspace-ts-morph';
import { readFileSync } from 'fs';
import {
  join,
  relative,
} from 'path';
import * as process from 'process';
import { addJsDoc } from './add-js-doc';
import { composeContext } from './compose-context';
import { createOpenApi } from './open-ai-instance';
import { processProject } from './process-project';
import { prompt } from './prompt';
import { DocumentationGeneratorSchema } from './schema';

function skipProject(project: ProjectConfiguration, projectName: string, options: DocumentationGeneratorSchema) {

  if (options.project === projectName) {
    return false;
  }

  if (options.projects?.length) {
    return !options.projects.includes(projectName);
  }

  return false;

}

export async function documentationGenerator(
  tree: Tree,
  options: DocumentationGeneratorSchema,
) {

  const openaiApiKey = options.openaiApiKey ?? process.env.OPENAI_API_KEY;
  const openaiOrganization = options.openaiOrgId ?? process.env.OPENAI_ORG_ID ?? process.env.OPENAI_ORGANIZATION;
  const openaiProjectId = options.openaiProjectId ?? process.env.OPENAI_PROJECT_ID;

  if (!openaiApiKey) {
    throw new Error('Can not find OPENAI_API_KEY environment variable');
  }

  await createOpenApi({
    apiKey: openaiApiKey,
    organization: openaiOrganization,
    project: openaiProjectId,
  });

  // relative path form the workspace root
  const path = relative(tree.root, process.cwd());

  const systemPrompt = readFileSync(join(__dirname, 'system-prompts', 'generic.txt'), 'utf-8');

  await TsMorphTransform(tree, path, async (project) => {
    for (const sourceFile of project.getSourceFiles()) {

      const context = composeContext(sourceFile);

      let target = `<sourceFile path="${ sourceFile.getFilePath() }">\n`;
      target += sourceFile.getText({ trimLeadingIndentation: true, includeJsDocComments: false });
      target += '</sourceFile>\n';

      for (const functionDeclaration of sourceFile.getFunctions()) {
        const question = `TASK: create the JsDoc documentation for the function \`${functionDeclaration.getName()}\` from the file \`${sourceFile.getFilePath()}\``;

        console.log(question);
        try {
          const jsDoc = await prompt(options, systemPrompt, [ context, target, question ].join('\n\n'));

          console.log('jsDoc', jsDoc);

          addJsDoc(options, functionDeclaration, jsDoc);

        } catch (e: any) {
          console.log(`jsDoc prompt error: ${e.message}`.red);
        }

        return;
      }
    }
  });

}

export default documentationGenerator;
